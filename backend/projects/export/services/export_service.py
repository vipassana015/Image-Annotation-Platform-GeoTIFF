import os
import shutil
from django.conf import settings
from projects.models import Dataset, DatasetImage, Annotation


class ExportService:

    def __init__(self, dataset_id):
        self.dataset = Dataset.objects.filter(id=dataset_id).first()
        if not self.dataset:
            raise Exception(f"Dataset {dataset_id} not found in DB")

        self.project = self.dataset.project

    # ------------------ FILES ------------------
    def get_dataset_files(self, image_ids=None):
        dataset_images = DatasetImage.objects.filter(dataset=self.dataset)

        if image_ids:
            dataset_images = dataset_images.filter(uploaded_file_id__in=image_ids)

        files = []

        for di in dataset_images:
            uploaded_file = di.uploaded_file

            if not uploaded_file or not uploaded_file.file:
                continue

            try:
                path = uploaded_file.file.path
            except:
                continue

            files.append({
                "id": uploaded_file.id,
                "path": path,
                "name": os.path.basename(uploaded_file.file.name),
                "width": uploaded_file.width,
                "height": uploaded_file.height,
            })

        print("✅ RETURNING FILES:", files)
        return files

    # ------------------ ANNOTATIONS ------------------
    def get_annotations(self):
        dataset_images = DatasetImage.objects.filter(dataset=self.dataset)
        uploaded_files = [item.uploaded_file for item in dataset_images]

        return Annotation.objects.filter(
            uploaded_file__in=uploaded_files
        ).select_related("class_label", "uploaded_file")

    # ------------------ EXPORT ------------------
    def export(self, format_type, image_ids=None):
        # 🔥 STEP 1 — DEFINE EXPORT DIR
        self.export_dir = os.path.join("exports", f"dataset_{self.dataset.id}")

        # 🔥 STEP 2 — CLEAN OLD EXPORT
        if os.path.exists(self.export_dir):
            shutil.rmtree(self.export_dir)

        # 🔥 STEP 3 — CREATE FRESH DIR
        os.makedirs(self.export_dir, exist_ok=True)

        # 🔥 STEP 4 — GET FILES (FILTERED)
        files = self.get_dataset_files(image_ids)
        print("FILES VALUE:", files)
        print("FILES TYPE:", type(files))

        annotations = self.get_annotations()

        print("🔥 FILES:", len(files))
        print("🔥 ANNOTATIONS:", len(annotations))
        print("🔥 EXPORT CALLED WITH:", format_type)

        # 🔥 STEP 5 — EXPORT FORMAT
        if format_type == "yolo":
            from .yolo_exporter import YOLOExporter
            exporter = YOLOExporter(self.dataset, files, annotations)

        elif format_type == "coco":
            from .coco_exporter import COCOExporter
            exporter = COCOExporter(self.dataset, files, annotations)

        else:
            raise ValueError("Unsupported format")

        # 🔥 STEP 6 — GENERATE FILES
        export_path = exporter.generate()

        # 🔥 STEP 7 — ZIP
        from .zip_utils import create_zip
        zip_path = create_zip(export_path)

        return zip_path