# projects/serializers.py
from rest_framework import serializers
from .models import Project, UploadedFile, ProjectMembership, Activity, Notification
from .models import Batch
from .models import ClassLabel, Annotation
from .models import Dataset, DatasetImage
from django.contrib.auth.models import User
import os

class ProjectSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "visibility",
            "image_count",
            "last_edited",
            "thumbnail",
            "thumbnail_url",
            "members",
            "deleted_at",
        ]
        read_only_fields = ["id", "image_count", "last_edited"]

    def get_members(self, project):
        memberships = project.memberships.select_related("user").all()
        return [
        {
            "id": m.user.id,
            "username": m.user.username,
            "initial": m.user.username[:1].upper()
        }
        for m in memberships
    ]    

    def get_thumbnail_url(self, project):
        # get latest batch with a thumbnail
        batch = (
            project.batches
            .filter(files__thumbnail__isnull=False)
            .order_by("-created_at")
            .first()
        )

        if not batch:
            return None

        file = (
            batch.files
            .filter(thumbnail__isnull=False)
            .order_by("uploaded_at")
            .first()
        )

        if file and file.thumbnail:
            return file.thumbnail.url

        return None
 


class UploadedFileSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    filename = serializers.SerializerMethodField()
    thumbnail_url = serializers.ImageField(
    source="thumbnail",
    read_only=True
)

    class Meta:
        model = UploadedFile
        fields = [
            'id',
            'project',  
            'project_name',
            'file',
            'filename',
            'is_annotated',
            'thumbnail_url',
            'uploaded_by',
            'uploaded_by_username',
            'uploaded_at',
            'width',
            'height',
            'crs',
            'bbox',
            'meta'
        ]

    def get_filename(self, obj):
        return os.path.basename(obj.file.name)    

class BatchSerializer(serializers.ModelSerializer):
    file_count = serializers.IntegerField(source="files.count", read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = [
            "id",
            "name",
            "file_count",
            "thumbnail_url",
            "created_at",
        ]
    
    def get_thumbnail_url(self, batch):
        first_file = batch.files.filter(
            thumbnail__isnull=False
        ).order_by("uploaded_at").first()

        if first_file and first_file.thumbnail:
            return first_file.thumbnail.url

        return None

class ClassLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassLabel
        fields = ["id", "project", "name", "color", "created_at"]
        read_only_fields = ["id", "created_at"]

class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = [
            "id",
            "uploaded_file",
            "class_label",
            "x",
            "y",
            "width",
            "height",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'name', 'project', 'created_at']


class DatasetImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetImage
        fields = ['id', 'dataset', 'uploaded_file', 'added_at']

from rest_framework import serializers
from .models import Dataset, DatasetImage


class DatasetSerializer(serializers.ModelSerializer):
    image_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = [
            'id',
            'name',
            'project',
            'created_at',
            'image_count',
            'thumbnail_url'  
        ]

    def get_image_count(self, obj):
        return DatasetImage.objects.filter(dataset=obj).count()

    def get_thumbnail_url(self, obj):
        first = DatasetImage.objects.filter(dataset=obj).first()

        if first and first.uploaded_file and first.uploaded_file.file:
            return first.uploaded_file.file.url

        return None
    
class ProjectMembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = ProjectMembership
        fields = ["id", "user", "username", "email", "role", "joined_at"]
        read_only_fields = ["id", "joined_at"]

class ActivitySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Activity
        fields = [
            "id",
            "username",
            "project_name",
            "action",
            "message",
            "created_at",
        ]

class NotificationSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    project_id = serializers.IntegerField(source="project.id", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "project_id",
            "project_name",
            "type",
            "message",
            "is_read",
            "created_at",
        ]