from django.db import models
from django.contrib.auth.models import User

from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            ProjectMembership.objects.create(
            user=self.user,
            project=self,
            role="owner"
        )

    VISIBILITY_CHOICES = [
        ("private", "Private"),
        ("team", "Team"),
        ("public", "Public"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="projects"
    )

    name = models.CharField(max_length=255)

    # Phase-1 fields
    description = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=10,
        choices=VISIBILITY_CHOICES,
        default="private"
    )

    image_count = models.IntegerField(default=0)
    last_edited = models.DateTimeField(auto_now=True)
    thumbnail = models.ImageField(
        upload_to="thumbnails/",
        null=True,
        blank=True
    )

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
    
class ProjectMembership(models.Model):

    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("annotator", "Annotator"),
        ("viewer", "Viewer"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="project_memberships"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="memberships"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="annotator"
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "project")

    def __str__(self):
        return f"{self.user.username} → {self.project.name} ({self.role})"
    


class Batch(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("annotating", "Annotating"),
        ("completed", "Completed"),
        ("archived", "Archived"),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="batches"
    )

    name = models.CharField(
        max_length=255,
        blank=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="open"
    )

    image_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.project.name} | {self.name or 'Batch'}"


class UploadedFile(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="uploads"
    )

    batch = models.ForeignKey(
        Batch,
        on_delete=models.CASCADE,
        related_name="files",
        null=True,
        blank=True
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    file = models.FileField(upload_to="uploads/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_annotated = models.BooleanField(default=False)

    thumbnail = models.ImageField(
    upload_to="thumbnails/",
    null=True,
    blank=True
)

    # GeoTIFF metadata (future phases)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    crs = models.CharField(max_length=120, null=True, blank=True)
    bbox = models.JSONField(null=True, blank=True)
    meta = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.project.name} - {self.file.name}"

class ClassLabel(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="class_labels"
    )

    name = models.CharField(max_length=100)

    color = models.CharField(
        max_length=7,  # Hex color like #ff0000
        default="#9ca3af"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "name")

    def __str__(self):
        return f"{self.project.name} | {self.name}"

class Annotation(models.Model):
    uploaded_file = models.ForeignKey(
        UploadedFile,
        on_delete=models.CASCADE,
        related_name="annotations"
    )

    class_label = models.ForeignKey(
        ClassLabel,
        on_delete=models.SET_NULL,
        null=True,
        related_name="annotations"
    )

    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Annotation {self.id} on {self.uploaded_file.file.name}"

class Dataset(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(
        'Project',
        on_delete=models.CASCADE,
        related_name='datasets'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class DatasetImage(models.Model):
    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name='dataset_images'
    )
    uploaded_file = models.ForeignKey(
        'UploadedFile',
        on_delete=models.CASCADE,
        related_name='dataset_links'
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('dataset', 'uploaded_file')  # 🚨 prevents duplicates

    def __str__(self):
        return f"{self.dataset.name} - {self.uploaded_file.id}"
    
class RecentProjectView(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="recent_projects"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="recent_views"
    )

    last_viewed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "project")
        ordering = ["-last_viewed"]

    def __str__(self):
        return f"{self.user.username} → {self.project.name} (recent)"
    
class Activity(models.Model):

    ACTION_CHOICES = [
        ("project_created", "Project Created"),
        ("member_added", "Member Added"),
        ("file_uploaded", "File Uploaded"),
        ("annotation_created", "Annotation Created"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="activities"
    )

    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES
    )

    message = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.project.name}"
    
class Notification(models.Model):

    TYPE_CHOICES = [
        ("member_added", "Member Added"),
        ("role_changed", "Role Changed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES
    )

    message = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type}"# (appended by trash feature)
