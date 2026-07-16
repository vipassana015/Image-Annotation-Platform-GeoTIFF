import React, { useState, useEffect } from "react";
import "./ExportModal.css";

const ExportModal = ({
  onClose,
  datasetName,
  projectName,
  selectedImages,
  datasetId,
  totalImages
}) => {
  const [format, setFormat] = useState("yolo");
  const [finalImages, setFinalImages] = useState([]);
  
  useEffect(() => {
  setFinalImages(selectedImages);
}, [selectedImages]);


  const handleExportClick = async () => {
    try {
      const token = localStorage.getItem("access_token");
      console.log("TOKEN:", token);
      console.log("FINAL IMAGES SENT:", finalImages);

      if (!token) {
        alert("You are not logged in");
        return;
      }

      let response;

      if (finalImages.length > 0) {
        // ✅ SELECTED EXPORT
        response = await fetch(
          `http://127.0.0.1:8000/api/datasets/${datasetId}/export/?format=${format}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              image_ids: finalImages,
            }),
          }
        );
      } else {
        // ✅ FULL EXPORT
        response = await fetch(
          `http://127.0.0.1:8000/api/datasets/${datasetId}/export/?format=${format}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `dataset_${datasetId}_${format}.zip`;
      a.click();

      window.URL.revokeObjectURL(downloadUrl);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  return (
    <div className="modal-overlay">
  <div className="export-modal">

    <div className="export-header">

  <div className="export-row">
    <span className="export-label-bold">Project Name:</span>
    <span className="export-value">{projectName}</span>
  </div>

  <div className="export-row">
    <span className="export-label-bold">Dataset:</span>
    <span className="export-value">{datasetName}</span>
  </div>

  <div className="export-row">
    <span className="export-label-bold">Total Images:</span>
    <span className="export-value">{totalImages}</span>

    {selectedImages.length > 0 && (
      <span className="selected-count">
        ({selectedImages.length} selected)
      </span>
    )}
  </div>

</div>

    {/* FORMAT OPTIONS */}
    <div className="export-label">Export Format</div>
    <div className="export-options">
      <div
        className={`export-option ${format === "yolo" ? "active" : ""}`}
        onClick={() => setFormat("yolo")}
      >
        YOLO
      </div>

      <div
        className={`export-option ${format === "coco" ? "active" : ""}`}
        onClick={() => setFormat("coco")}
      >
        COCO
      </div>
    </div>

    {/* ACTION BUTTONS */}
   <div className="export-actions">
  <div></div>

  <div style={{ display: "flex", gap: "10px" }}>
      <button className="modal-btn" onClick={onClose}>
        Cancel
      </button>

     <button className="modal-btn primary" onClick={handleExportClick}>
        Export
      </button>
    </div>

  </div>
    </div>
</div>
  );
};


export default ExportModal;