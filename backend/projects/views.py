# projects/views.py

import os
import rasterio
from django.db.models import Q
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.http import FileResponse

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.decorators import api_view

from .models import Project, UploadedFile, Batch, Dataset, DatasetImage, ProjectMembership, RecentProjectView, Activity, Notification, ClassLabel
from .serializers import ProjectSerializer, UploadedFileSerializer, BatchSerializer, DatasetSerializer, DatasetImageSerializer,ProjectMembershipSerializer, ActivitySerializer, NotificationSerializer, ClassLabelSerializer, UserSerializer
 
from projects.utils.thumbnails import generate_thumbnail
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .export.services.export_service import ExportService


# Signup
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Login
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)

            return Response({
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user_id": user.id
            })

        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )


def has_project_access(user, project):
    return ProjectMembership.objects.filter(
        user=user,
        project=project
    ).exists()

def get_user_role(user, project):
    membership = ProjectMembership.objects.filter(
        user=user,
        project=project
    ).first()

    return membership.role if membership else None

def is_owner_or_admin(user, project):
    membership = ProjectMembership.objects.filter(user=user, project=project).first()
    return membership and membership.role in ["owner", "admin"]


def can_upload(user, project):
    role = get_user_role(user, project)
    return role in ["owner", "admin"]


def can_annotate(user, project):
    role = get_user_role(user, project)
    return role in ["owner", "admin", "annotator"]


class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_id):
        print("FILES:", request.FILES)
        print("FILES LIST:", request.FILES.getlist("files"))

        # 1. Fetch project
        project = get_object_or_404(Project, id=project_id)

        # 2. Ownership check
        if not has_project_access(request.user, project):
            return Response(
                {"detail": "You do not have access to this project."},
                status=status.HTTP_403_FORBIDDEN
                )
            
        if not can_upload(request.user, project):
            return Response(
                {"detail": "You do not have permission to upload files."},
                status=status.HTTP_403_FORBIDDEN
                )

        # 3. Get files
        files = request.FILES.getlist("files")
        if not files:
            return Response(
                {"detail": "No files provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Batch logic
        batch_id = request.data.get("batch_id")
        new_batch_name = request.data.get("new_batch_name")

        if batch_id:
            batch = get_object_or_404(Batch, id=batch_id, project=project)

        elif new_batch_name:
            if Batch.objects.filter(project=project, name=new_batch_name).exists():
                return Response(
                    {"detail": "Batch with this name already exists."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            batch = Batch.objects.create(
                project=project,
                name=new_batch_name,
                created_by=request.user
            )

            Activity.objects.create(
                user=request.user,
                project=project,
                action="batch_created",
                message=f"Created batch '{batch.name}' in project '{project.name}'"
            )

        else:
            return Response(
                {"detail": "Provide batch_id or new_batch_name."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Process files
        uploaded_files_response = []

        try:
            for uploaded_file in files:

                ext = os.path.splitext(uploaded_file.name)[1].lower()
                if ext not in [".tif", ".tiff"]:
                    continue
                
                new_file = UploadedFile.objects.create(
                    project=project,
                    batch=batch,
                    file=uploaded_file,
                    uploaded_by=request.user
                    )
                
                try:
                    with rasterio.open(new_file.file.path) as src:
                        new_file.width = src.width
                        new_file.height = src.height
                        
                        if src.crs:
                            new_file.crs = str(src.crs)
                            
                            new_file.bbox = {
                                "left": src.bounds.left,
                                "bottom": src.bounds.bottom,
                                "right": src.bounds.right,
                                "top": src.bounds.top,
                                }
                            
                            new_file.save(
                                update_fields=[
                                    "width",
                                    "height",
                                    "crs",
                                    "bbox"
                                    ]
                                    )
                        
                except Exception as e:
                    print("Rasterio failed:", e)

                Activity.objects.create(
                    user=request.user,
                    project=project,
                    action="file_uploaded",
                    message=f"Uploaded file '{uploaded_file.name}' to project '{project.name}'"
                )

                # Thumbnail (optional)
                try:
                    thumbnail_filename = (
                        os.path.splitext(os.path.basename(new_file.file.name))[0] + ".png"
                    )

                    thumbnail_path = os.path.join(
                        settings.MEDIA_ROOT,
                        "thumbnails",
                        thumbnail_filename
                    )

                    generate_thumbnail(
                        geotiff_path=new_file.file.path,
                        output_path=thumbnail_path
                    )

                    new_file.thumbnail = os.path.join(
                        "thumbnails",
                        thumbnail_filename
                    )
                    new_file.save(update_fields=["thumbnail"])

                except Exception as e:
                    print("Thumbnail failed:", e)

                uploaded_files_response.append({
                    "id": new_file.id,
                    "filename": new_file.file.name,
                })

        except Exception as e:
            print("ERROR:", str(e))
            return Response({"detail": str(e)}, status=500)

        # 6. Update project count
        project.image_count += len(uploaded_files_response)
        project.save(update_fields=["image_count"])

        return Response({
            "files": uploaded_files_response,
            "project_id": project.id,
            "batch_id": batch.id,
            "batch": batch.name,
            "image_count": project.image_count,
        }, status=status.HTTP_201_CREATED)

class UploadedFileDetailView(RetrieveAPIView):
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
        memberships__user=self.request.user
    ).distinct()

    def perform_create(self, serializer):
        project = serializer.save(user=self.request.user)
        
        Activity.objects.create(
            user=self.request.user,
            project=project,
            action="project_created",
            message=f"Created project '{project.name}'"
        )

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        })

class ProjectDetailView(RetrieveAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
            Q(user=self.request.user) |
            Q(memberships__user=self.request.user)
        ).distinct()

    def retrieve(self, request, *args, **kwargs):
        project = self.get_object()
        
        RecentProjectView.objects.update_or_create(
            user=request.user,
            project=project,
            defaults={"last_viewed": timezone.now()}
            )

        serializer = self.get_serializer(project)
        return Response(serializer.data)


class BatchListView(ListAPIView):
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(Project, id=self.kwargs["project_id"])

        if not has_project_access(self.request.user, project):
            return Batch.objects.none()

        return Batch.objects.filter(project=project).order_by("created_at")
    
class DeleteBatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, batch_id):
        batch = get_object_or_404(Batch, id=batch_id)
        project = batch.project

        # Permission check
        if not has_project_access(request.user, project):
            return Response({"detail": "No access"}, status=403)

        if not is_owner_or_admin(request.user, project):
            return Response({"detail": "Not allowed"}, status=403)

        # Get image count BEFORE delete
        image_count = batch.files.count()

        # Delete batch (cascade handles everything)
        batch.delete()

        # Update project count
        project.image_count = max(0, project.image_count - image_count)
        project.save(update_fields=["image_count"])

        return Response({"message": "Batch deleted"})    


class BatchFilesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_id, batch_id):
        project = get_object_or_404(Project, id=project_id)

        if not has_project_access(request.user, project):
            return Response(
                {"detail": "You do not have permission to view files for this project."},
                status=status.HTTP_403_FORBIDDEN
            )

        batch = get_object_or_404(
            Batch,
            id=batch_id,
            project=project
        )

        files = UploadedFile.objects.filter(
            project=project,
            batch=batch
        ).order_by("uploaded_at")

        serializer = UploadedFileSerializer(files, many=True)

        return Response(serializer.data)
    
class DeleteImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, image_id):
        # 1. Get image
        uploaded_file = get_object_or_404(UploadedFile, id=image_id)
        project = uploaded_file.project
        batch = uploaded_file.batch

        # 2. Permission check
        if not has_project_access(request.user, project):
            return Response(
                {"detail": "No access to this project"},
                status=status.HTTP_403_FORBIDDEN
            )

        if not is_owner_or_admin(request.user, project):
            return Response(
                {"detail": "Only owner/admin can delete images"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 3. Store file path BEFORE delete
        file_path = uploaded_file.file.path if uploaded_file.file else None

        # 4. Delete DB object (CASCADE handles annotations + dataset links)
        uploaded_file.delete()

        # 5. Delete actual file from disk
        if file_path and os.path.exists(file_path):
            os.remove(file_path)

        # 6. Update counts
        if batch:
            batch.image_count = max(0, batch.image_count - 1)
            batch.save(update_fields=["image_count"])

        project.image_count = max(0, project.image_count - 1)
        project.save(update_fields=["image_count"])

        return Response({"message": "Image deleted successfully"})


class ProjectFilesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        if not has_project_access(request.user, project):
            return Response(status=403)

        files = UploadedFile.objects.filter(project=project)

        serializer = UploadedFileSerializer(files, many=True)
        return Response(serializer.data)
    
@api_view(['GET'])
def get_datasets(request):
    project_id = request.GET.get('project_id')

    if not project_id:
        return Response(
            {"error": "project_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    datasets = Dataset.objects.filter(project_id=project_id)
    serializer = DatasetSerializer(datasets, many=True)

    return Response(serializer.data)

@api_view(['POST'])
def create_dataset(request):
    serializer = DatasetSerializer(data=request.data)

    if serializer.is_valid():
        dataset = serializer.save()
        
        Activity.objects.create(
            user=request.user,
            project=dataset.project,
            action="dataset_created",
            message=f"Created dataset '{dataset.name}' in project '{dataset.project.name}'"
            )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def add_image_to_dataset(request):
    serializer = DatasetImageSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  


@api_view(['GET'])
def get_dataset_images(request, dataset_id):
    dataset_images = DatasetImage.objects.filter(dataset_id=dataset_id)

    data = []

    for item in dataset_images:
        uploaded = item.uploaded_file

        data.append({
            "id": uploaded.id,
            "filename": os.path.basename(uploaded.file.name) if uploaded.file else "image",
            "file_url": uploaded.file.url if uploaded.file else None,
            "batch_id": getattr(uploaded, "batch_id", None),
        })

    return Response(data)


@api_view(['DELETE'])
def remove_image_from_dataset(request, dataset_id, image_id):
    try:
        obj = DatasetImage.objects.get(
            dataset_id=dataset_id,
            uploaded_file_id=image_id
        )
        obj.delete()
        return Response({"message": "Removed successfully"})
    except DatasetImage.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    
class ProjectMembersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        if not has_project_access(request.user, project):
            return Response(status=403)

        members = ProjectMembership.objects.filter(project=project)
        serializer = ProjectMembershipSerializer(members, many=True)

        return Response(serializer.data)
    
class AddProjectMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        if not is_owner_or_admin(request.user, project):
            return Response(
                {"detail": "Only owner/admin can add members."},
                status=403
            )

        identifier = request.data.get("identifier")  # email or username
        role = request.data.get("role", "annotator")

        if not identifier:
            return Response({"detail": "Identifier required"}, status=400)

        # Find user
        user = User.objects.filter(
            Q(username=identifier) | Q(email=identifier)
        ).first()

        if not user:
            return Response({"detail": "User not found"}, status=404)

        # Prevent duplicate
        if ProjectMembership.objects.filter(user=user, project=project).exists():
            return Response({"detail": "User already a member"}, status=400)

        membership = ProjectMembership.objects.create(
            user=user,
            project=project,
            role=role
        )

        notification = Notification.objects.create(
            user=user,
            project=project,
            type="member_added",
            message=f"You were added to project '{project.name}' as {role}"
            )
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",{
                "type": "send_notification",
                "data": {
                    "message": notification.message,
                    "project_id": notification.project.id,}
                    }
        )

        Activity.objects.create(
            user=request.user,
            project=project,
            action="member_added",
            message=f"Added {user.username} to project '{project.name}' as {role}"
        )

        return Response(ProjectMembershipSerializer(membership).data, status=201)
    
class RemoveProjectMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, project_id, user_id):
        project = get_object_or_404(Project, id=project_id)

        if not is_owner_or_admin(request.user, project):
            return Response(status=403)

        membership = get_object_or_404(
            ProjectMembership,
            project=project,
            user_id=user_id
        )

        # Prevent removing owner
        if membership.role == "owner":
            return Response({"detail": "Cannot remove owner"}, status=400)
        
        Activity.objects.create(
            user=request.user,
            project=project,
            action="member_removed",
            message=f"Removed {membership.user.username} from project '{project.name}'"
        )

        notification = Notification.objects.create(
            user=membership.user,
            project=project,
            type="member_removed",
            message=f"You were removed from project '{project.name}'"
        )

        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            f"user_{membership.user.id}",
            {
        "type": "send_notification",
        "data": {
            "message": notification.message,
            "project_id": notification.project.id,
        }
    }
)

        membership.delete()
        return Response({"detail": "Removed successfully"})
    
class UpdateMemberRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, project_id, user_id):
        project = get_object_or_404(Project, id=project_id)

        if not is_owner_or_admin(request.user, project):
            return Response(status=403)

        membership = get_object_or_404(
            ProjectMembership,
            project=project,
            user_id=user_id
        )

        new_role = request.data.get("role")

        if new_role not in ["admin", "annotator", "viewer"]:
            return Response({"detail": "Invalid role"}, status=400)

        # Prevent changing owner role
        if membership.role == "owner":
            return Response({"detail": "Cannot change owner role"}, status=400)

        old_role = membership.role
        membership.role = new_role

        membership.save()

        notification = Notification.objects.create(
            user=membership.user,
            project=project,
            type="role_changed",
            message=f"Your role was changed to {new_role} in '{project.name}'"
        )

        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            f"user_{membership.user.id}",{
        "type": "send_notification",
        "data": {
            "message": notification.message,
            "project_id": notification.project.id,
        }
    }
)


        Activity.objects.create(
            user=request.user,
            project=project,
            action="role_changed",
            message=f"Changed role of {membership.user.username} from {old_role} to {new_role} in '{project.name}'"
            )

        return Response({"detail": "Role updated"})
    
class OwnedProjectsView(ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
            user=self.request.user
        ).order_by("-last_edited")
    
class SharedProjectsView(ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
            memberships__user=self.request.user
        ).exclude(
            user=self.request.user
        ).distinct().order_by("-last_edited")
    
class RecentProjectsView(ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        recent_views = RecentProjectView.objects.filter(
            user=request.user
        ).select_related("project").order_by("-last_viewed")

        projects = [rv.project for rv in recent_views]

        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)
    
class ActivityListView(ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Activity.objects.filter(
            project__memberships__user=self.request.user
        ).order_by("-created_at")
    
class NotificationListView(ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")
    
class MarkNotificationReadView(APIView):
        permission_classes = [permissions.IsAuthenticated]

        def patch(self, request, notification_id):
            notification = get_object_or_404(
                Notification,
                id=notification_id,
                user=request.user
            )

            notification.is_read = True
            notification.save()

            return Response({"detail": "Marked as read"})
        
class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({"detail": "All marked as read"})

class DatasetExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # ✅ FULL DATASET EXPORT
    def get(self, request, dataset_id):
        format_type = request.GET.get("format", "yolo")

        service = ExportService(dataset_id)
        zip_path = service.export(format_type)

        return FileResponse(
            open(zip_path, "rb"),
            as_attachment=True,
            filename=f"dataset_{dataset_id}_{format_type}.zip"
        )

    # ✅ SELECTED EXPORT
    def post(self, request, dataset_id):
        format_type = request.GET.get("format", "yolo")
        image_ids = request.data.get("image_ids", [])

        service = ExportService(dataset_id)
        zip_path = service.export(format_type, image_ids=image_ids)

        return FileResponse(
            open(zip_path, "rb"),
            as_attachment=True,
            filename=f"dataset_{dataset_id}_{format_type}.zip"
        )
    
class DeleteDatasetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, dataset_id):
        dataset = get_object_or_404(Dataset, id=dataset_id)
        project = dataset.project

        # Permission check
        if not has_project_access(request.user, project):
            return Response({"detail": "No access"}, status=403)

        if not is_owner_or_admin(request.user, project):
            return Response({"detail": "Not allowed"}, status=403)

        dataset.delete()

        return Response({"message": "Dataset deleted"})
    
class DeleteProjectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        # Permission check
        if not is_owner_or_admin(request.user, project):
            return Response({"detail": "Not allowed"}, status=403)

        #  Collect file paths BEFORE delete
        files = UploadedFile.objects.filter(project=project)

        file_paths = []
        for f in files:
            if f.file:
                file_paths.append(f.file.path)

        # Delete project (cascade everything)
        project.delete()

        #  Delete files from disk
        for path in file_paths:
            if os.path.exists(path):
                os.remove(path)

        return Response({"message": "Project deleted"})
    
class ClassListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        if not has_project_access(request.user, project):
            return Response(status=403)

        classes = ClassLabel.objects.filter(project=project).order_by("id")
        serializer = ClassLabelSerializer(classes, many=True)

        return Response(serializer.data)

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        if not is_owner_or_admin(request.user, project):
            return Response({"detail": "Not allowed"}, status=403)

        data = request.data.copy()
        data["project"] = project.id

        serializer = ClassLabelSerializer(data=data)

        if serializer.is_valid():
            serializer.save()

            Activity.objects.create(
                user=request.user,
                project=project,
                action="class_created",
                message=f"Created class '{data.get('name')}'"
            )

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    
class ClassDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, class_id):
        class_obj = get_object_or_404(ClassLabel, id=class_id)
        project = class_obj.project

        if not is_owner_or_admin(request.user, project):
            return Response({"detail": "Not allowed"}, status=403)

        serializer = ClassLabelSerializer(class_obj, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, class_id):
        class_obj = get_object_or_404(ClassLabel, id=class_id)
        project = class_obj.project

        if not is_owner_or_admin(request.user, project):
            return Response({"detail": "Not allowed"}, status=403)

        # Prevent delete if used
        if class_obj.annotations.exists():
            return Response(
                {"detail": "Class is used in annotations. Cannot delete."},
                status=400
            )

        class_obj.delete()

        return Response({"message": "Class deleted"})