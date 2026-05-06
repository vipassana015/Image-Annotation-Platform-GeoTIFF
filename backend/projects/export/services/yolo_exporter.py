import os
import shutil
from collections import defaultdict

class YOLOExporter:

    def __init__(self, dataset, files, annotations):
        self.dataset = dataset
        self.files = files
        self.annotations = annotations

        # output directory
        self.base_path = os.path.join("temp_exports", f"dataset_{dataset.id}_yolo")

        self.images_path = os.path.join(self.base_path, "images")
        self.labels_path = os.path.join(self.base_path, "labels")

    def setup_dirs(self):
        os.makedirs(self.images_path, exist_ok=True)
        os.makedirs(self.labels_path, exist_ok=True)

    def copy_images(self):
        for file in self.files:
            src = file["path"]
            dst = os.path.join(self.images_path, file["name"])

            shutil.copy(src, dst)

    def group_annotations(self):
        grouped = defaultdict(list)

        for ann in self.annotations:
            file_id = ann.uploaded_file.id
            grouped[file_id].append(ann)

        return grouped

    def get_class_mapping(self):
        """
        Map class labels → numeric IDs
        """
        classes = {}
        current_id = 0

        for ann in self.annotations:
            label = ann.class_label.name if ann.class_label else "unknown"

            if label not in classes:
                classes[label] = current_id
                current_id += 1

        return classes

    def convert_to_yolo(self, ann, img_w, img_h):
        x = ann.x
        y = ann.y
        w = ann.width
        h = ann.height

        x_center = (x + w / 2) / img_w
        y_center = (y + h / 2) / img_h
        w = w / img_w
        h = h / img_h

        return x_center, y_center, w, h

    def create_label_files(self):
        grouped = self.group_annotations()
        class_map = self.get_class_mapping()

        for file in self.files:
            file_id = file["id"]
            filename = os.path.splitext(file["name"])[0] + ".txt"
            label_file_path = os.path.join(self.labels_path, filename)

            anns = grouped.get(file_id, [])

            with open(label_file_path, "w") as f:
                for ann in anns:
                    label_name = ann.class_label.name if ann.class_label else "unknown"
                    class_id = class_map[label_name]

                    x, y, w, h = self.convert_to_yolo(
                        ann,
                        file["width"],
                        file["height"]
                    )

                    line = f"{class_id} {x} {y} {w} {h}\n"
                    f.write(line)

    def generate(self):
        self.setup_dirs()
        self.copy_images()
        self.create_label_files()

        return self.base_path