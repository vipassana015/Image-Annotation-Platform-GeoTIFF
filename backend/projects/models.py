from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=100)
    thumbnail = models.ImageField(upload_to='thumbnails/', null=True, blank=True)
    last_edited = models.DateTimeField(auto_now=True)
    image_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name


# ======================
# NEW MODEL for Uploaded Files
# ======================
class UploadedFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='uploads')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # optional metadata (if you later parse GeoTIFFs)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    crs = models.CharField(max_length=120, null=True, blank=True)
    bbox = models.JSONField(null=True, blank=True)
    meta = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.project.name} - {self.file.name}"
