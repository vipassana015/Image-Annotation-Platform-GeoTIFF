import os

from django.core.management.base import BaseCommand
from django.conf import settings

from projects.models import UploadedFile
from projects.utils.thumbnails import generate_thumbnail


class Command(BaseCommand):
    help = "Generate thumbnails for UploadedFile records missing thumbnails"

    def handle(self, *args, **options):
        files_without_thumbnails = UploadedFile.objects.filter(
            thumbnail__isnull=True
        )

        total = files_without_thumbnails.count()

        if total == 0:
            self.stdout.write("No files require thumbnail generation.")
            return

        self.stdout.write(f"Found {total} files without thumbnails.")

        for uploaded_file in files_without_thumbnails:
            try:
                if not uploaded_file.file:
                    continue

                thumbnail_filename = (
                    os.path.splitext(os.path.basename(uploaded_file.file.name))[0]
                    + ".png"
                )

                thumbnail_path = os.path.join(
                    settings.MEDIA_ROOT,
                    "thumbnails",
                    thumbnail_filename
                )

                generate_thumbnail(
                    geotiff_path=uploaded_file.file.path,
                    output_path=thumbnail_path
                )

                uploaded_file.thumbnail = os.path.join(
                    "thumbnails",
                    thumbnail_filename
                )
                uploaded_file.save(update_fields=["thumbnail"])

                self.stdout.write(
                    f"Generated thumbnail for file ID {uploaded_file.id}"
                )

            except Exception as e:
                self.stderr.write(
                    f"Failed for file ID {uploaded_file.id}: {e}"
                )
