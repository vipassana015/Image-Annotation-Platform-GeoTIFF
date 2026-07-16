import rasterio
from PIL import Image
from rest_framework import viewsets, permissions
from .models import ClassLabel, Annotation, ProjectMembership
from .serializers import ClassLabelSerializer, AnnotationSerializer
from rasterio.warp import transform


def get_user_role(user, project):
    membership = ProjectMembership.objects.filter(
        user=user,
        project=project
    ).first()

    return membership.role if membership else None


def can_annotate(user, project):
    role = get_user_role(user, project)
    return role in ["owner", "admin", "annotator"]


class ClassLabelViewSet(viewsets.ModelViewSet):
    serializer_class = ClassLabelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get("project_id")
        return ClassLabel.objects.filter(project_id=project_id)

    def perform_create(self, serializer):
        project_id = self.request.data.get("project")
        serializer.save(project_id=project_id)

class AnnotationViewSet(viewsets.ModelViewSet):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Annotation.objects.all()

        file_id = self.request.query_params.get(
            "uploaded_file_id"
        )

        if file_id:
            queryset = queryset.filter(
                uploaded_file__id=file_id
            )

        return queryset

    def perform_create(self, serializer):
        uploaded_file = serializer.validated_data["uploaded_file"]
        project = uploaded_file.project

        if not can_annotate(self.request.user, project):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You do not have permission to annotate."
            )

        annotation = serializer.save()

        try:
            with rasterio.open(uploaded_file.file.path) as src:
                 center_x = annotation.x + (annotation.width / 2)
                 center_y = annotation.y + (annotation.height / 2)
                 
                 thumb = Image.open(
                      uploaded_file.thumbnail.path
                 )
                 
                 thumb_width, thumb_height = thumb.size
                 
                 scale_x = (
                      uploaded_file.width /
                      thumb_width
                      )
                 
                 scale_y = (
                      uploaded_file.height /
                      thumb_height
                      )
                 
                 original_x = center_x * scale_x
                 original_y = center_y * scale_y

                 print(
                       "Thumbnail:",
                       center_x,
                       center_y
                       )
                 print(
                     "Original:",
                     original_x,
                     original_y
                     )
                 
                 utm_x, utm_y = src.xy(
                     original_y,
                     original_x
                     
                )
                 
                 lon, lat = transform(
                    src.crs,
                    "EPSG:4326",
                    [utm_x],
                    [utm_y]
                )
                 
                 annotation.utm_x = float(utm_x)
                 annotation.utm_y = float(utm_y)
                 annotation.latitude = float(lat[0])
                 annotation.longitude = float(lon[0])
                 
                 annotation.save(
                    update_fields=[
                        "utm_x",
                        "utm_y",
                        "latitude",
                        "longitude",
                    ]
                )

        except Exception as e:
            print("Coordinate conversion failed:", e)

        file = annotation.uploaded_file
        file.is_annotated = True
        file.save()

    def perform_destroy(self, instance):
        file = instance.uploaded_file

        instance.delete()

        if not file.annotations.exists():
            file.is_annotated = False
            file.save()