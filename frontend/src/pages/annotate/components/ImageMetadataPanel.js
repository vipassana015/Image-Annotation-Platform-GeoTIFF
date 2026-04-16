import { useState } from "react";

export default function ImageMetadataPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="sidebar-section metadata">
      <div
        className="metadata-header"
        onClick={() => setOpen(!open)}
      >
        <h4>Image Metadata</h4>
        <span>{open ? "▾" : "▸"}</span>
      </div>

      {open && (
        <div className="metadata-content">
          <div>CRS: EPSG:4326</div>
          <div>Resolution: 0.3 m/px</div>
          <div>Bounds: …</div>
        </div>
      )}
    </section>
  );
}
