import { useState } from "react";

export default function ImageMetadataPanel({ metadata }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="sidebar-section metadata">
      <div
        className="metadata-header"
        onClick={() => setOpen(!open)}
      >
        <h4>Image Metadata</h4>
        <span>{open ? "▾" : "▸"}</span>
      </div>

      {open && metadata && (
        <div className="metadata-content">

          <div>
            <strong>CRS:</strong>{" "}
            {metadata.crs || "Not Available"}
          </div>

          <div>
            <strong>Width:</strong>{" "}
            {metadata.width}
          </div>

          <div>
            <strong>Height:</strong>{" "}
            {metadata.height}
          </div>

          {metadata.bbox && (
            <>
              <div>
                <strong>Left:</strong>{" "}
                {metadata.bbox.left?.toFixed(2)}
              </div>

              <div>
                <strong>Bottom:</strong>{" "}
                {metadata.bbox.bottom?.toFixed(2)}
              </div>

              <div>
                <strong>Right:</strong>{" "}
                {metadata.bbox.right?.toFixed(2)}
              </div>

              <div>
                <strong>Top:</strong>{" "}
                {metadata.bbox.top?.toFixed(2)}
              </div>
            </>
          )}

        </div>
      )}
    </section>
  );
}