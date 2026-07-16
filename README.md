# Image Annotation Platform for GeoTIFF Images

> **Sponsored Final Year Engineering Project**

A full-stack web platform for annotating **GeoTIFF satellite and aerial imagery** while preserving geographic metadata. The platform supports dataset generation for computer vision and GIS applications by enabling annotation, geographic coordinate conversion, and export in industry-standard formats.

---

# Project Preview

## Landing Page

![Landing Page](assets/Home%20Page.png)

---

## Annotation Workspace

![Annotation Workspace](assets/Annotation%20Workspace%20Page.png)

---

# Features

- GeoTIFF Upload & Metadata Extraction
- Automatic PNG Thumbnail Generation
- Interactive Bounding Box Annotation
- Zoom & Pan Workspace
- Class Management
- Dataset Management
- Geographic Coordinate Conversion
- YOLO Export
- COCO Export
- CSV Export with Latitude & Longitude
- JWT Authentication

---

# 🌍 Geographic Coordinate Conversion

Unlike traditional annotation tools, annotations created on PNG thumbnails are converted back into their original GeoTIFF pixel locations before being transformed into real-world geographic coordinates.

The conversion pipeline is:

PNG Coordinates

↓

Original GeoTIFF Pixels

↓

Affine Transformation (UTM)

↓

CRS Transformation

↓

Latitude & Longitude

↓

Stored in Database & Exported

---

![Coordinate Conversion](assets/Output%203.png)

---

# 🛠 Tech Stack

### Frontend

- React.js
- React Router
- Axios
- React Konva
- Konva.js
- CSS

### Backend

- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Image Processing

- Rasterio
- Pillow (PIL)

---

# 📷 Application Screens

| Module | Screenshot |
|---------|------------|
| Dashboard | ![](assets/Dashboard%20Page.png) |
| Batch Management | ![](assets/Batch%20List%20Page.png) |
| Upload | ![](assets/Upload%20Page.png) |
| Annotation Workspace | ![](assets/Annotation%20Workspace%20Page.png) |
| Classes | ![](assets/Classes%20Page.png) |
| Members | ![](assets/Members%20Page.png) |
| Dataset | ![](assets/Dataset%20Page.png) |
| Export | ![](assets/Export%20Page.png) |

---

# 🎥 Demonstration

A walkthrough video of the platform is included in the repository.

---

# Future Scope

- Polygon Annotation
- Segmentation Masks
- AI-assisted Annotation
- Multi-user Collaboration
- Cloud Deployment
- Offline Synchronization
- 3D Geospatial Annotation

---

# Author

**Vipassana Shirsath**

Final Year Engineering Project
