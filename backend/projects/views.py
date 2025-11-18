from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Project, UploadedFile
from .serializers import ProjectSerializer, UploadedFileSerializer


# ======================
# EXISTING PROJECT LIST VIEW (unchanged)
# ======================
class ProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]  # later: change to IsAuthenticated

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        return Project.objects.filter(user_id=user_id)


# ======================
# NEW: File Upload API
# ======================
class FileUploadView(APIView):
    permission_classes = [permissions.AllowAny]  # later: restrict to project owner

    def post(self, request, project_id):
        """
        Handle file uploads for a specific project.
        URL: /api/projects/<project_id>/upload/
        """
        project = get_object_or_404(Project, id=project_id)

        # Ensure files exist
        if "file" not in request.FILES:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = request.FILES["file"]

        # Save file record
        new_file = UploadedFile.objects.create(
            project=project,
            file=uploaded_file,
            uploaded_by=request.user if request.user.is_authenticated else None,
        )

        # Increment image count for that project
        project.image_count += 1
        project.save()

        serializer = UploadedFileSerializer(new_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ======================
# OPTIONAL: View all uploaded files for a project
# ======================
class ProjectUploadsListView(generics.ListAPIView):
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return UploadedFile.objects.filter(project_id=project_id)
