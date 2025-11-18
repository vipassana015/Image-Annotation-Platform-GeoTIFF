from rest_framework import serializers
from .models import Project, UploadedFile


# ===== Project Serializer (unchanged) =====
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


# ===== Uploaded File Serializer =====
class UploadedFileSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)

    class Meta:
        model = UploadedFile
        fields = [
            'id',
            'project',
            'project_name',
            'file',
            'uploaded_by',
            'uploaded_by_username',
            'uploaded_at',
            'width',
            'height',
            'crs',
            'bbox',
            'meta'
        ]
