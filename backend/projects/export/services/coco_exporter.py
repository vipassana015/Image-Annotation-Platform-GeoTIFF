import os
import json
import shutil

class COCOExporter:

    def __init__(self, dataset, files, annotations):
        self.dataset = dataset
        self.files = files
        self.annotations = annotations

        self.base_path = os.path.join("temp_exports", f"dataset_{dataset.id}_coco")
        self.images_path = os.path.join(self.base_path, "images")

    def setup_dirs(self):
        os.makedirs(self.images_path, exist_ok=True)

    def copy_images(self):
        for file in self.files:
            src = file["path"]
            dst = os.path.join(self.images_path, file["name"])
            shutil.copy(src, dst)

    def build_categories(self):
        categories = []
        class_map = {}

        current_id = 1

        for ann in self.annotations:
            if ann.class_label:
                label = ann.class_label.name

                if label not in class_map:
                    class_map[label] = current_id
                    categories.append({
                        "id": current_id,
                        "name": label
                    })
                    current_id += 1

        return categories, class_map

    def build_images(self):
        images = []

        for file in self.files:
            images.append({
                "id": file["id"],
                "file_name": file["name"],
                "width": file["width"],
                "height": file["height"]
            })

        return images

    def build_annotations(self, class_map):
        annotations_list = []
        ann_id = 1

        for ann in self.annotations:
            if not ann.class_label:
                continue

            label_name = ann.class_label.name
            category_id = class_map[label_name]

            annotations_list.append({
                "id": ann_id,
                "image_id": ann.uploaded_file.id,
                "category_id": category_id,
                "bbox": [
                    ann.x,
                    ann.y,
                    ann.width,
                    ann.height
                ],
                "area": ann.width * ann.height,
                "iscrowd": 0
            })

            ann_id += 1

        return annotations_list

    def generate(self):
        self.setup_dirs()
        self.copy_images()

        categories, class_map = self.build_categories()
        images = self.build_images()
        annotations = self.build_annotations(class_map)

        coco_data = {
            "images": images,
            "annotations": annotations,
            "categories": categories
        }

        json_path = os.path.join(self.base_path, "annotations.json")

        with open(json_path, "w") as f:
            json.dump(coco_data, f, indent=4)

        return self.base_path