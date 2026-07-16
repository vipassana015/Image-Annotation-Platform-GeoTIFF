import { useEffect, useRef } from "react";
import ClassDropdown from "./ClassDropdown";

export default function AnnotationEditor({
  box,
  classes,
  onCreateClass,
  updateBoxClass,
  onDelete,
  onClose,
   setPopupSize,
}) {
  const containerRef = useRef(null);
  const selectRef = useRef(null);
  const popupRef = useRef(null);


  // Auto focus dropdown
  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  

  // ESC close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () =>
      window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!box) return null;

  return (
    <div
      ref={containerRef}
      className="annotation-popup"
       onMouseDown={(e) => e.stopPropagation()}
      style={{
        left: box.screenX,
        top: box.screenY,
      }}
    >
      {/* Header */}
      <div className="popup-header">
        <span>Label</span>
        <button
          className="popup-close"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Divider */}
      <div className="popup-divider" />

      {/* Body */}
      <div className="popup-body">  
        <ClassDropdown
        value={box.class_label}
        classes={classes}
        onCreateClass={async (name) => {
          const newClass = await onCreateClass(name);

    if (newClass) {
      updateBoxClass(box.id, newClass.id);
    }
  }}
  onChange={(id) => {
    updateBoxClass(box.id, id);
  }}
/>

{box.class_label && (
<div
  style={{
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid #374151",
  }}
>
  <div
    style={{
      fontSize: "11px",
      fontWeight: "600",
      color: "#9ca3af",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}
  >
    Geographic Coordinates
  </div>

  <div style={{ fontSize: "12px" }}>
    <strong>UTM X:</strong>{" "}
    {box.utm_x?.toFixed(2)}
  </div>

  <div style={{ fontSize: "12px" }}>
    <strong>UTM Y:</strong>{" "}
    {box.utm_y?.toFixed(2)}
  </div>

  <div
    style={{
      marginTop: "8px",
      fontSize: "12px",
    }}
  >
    <strong>Latitude:</strong>{" "}
    {box.latitude?.toFixed(6)}
  </div>

  <div style={{ fontSize: "12px" }}>
    <strong>Longitude:</strong>{" "}
    {box.longitude?.toFixed(6)}
  </div>
</div>
)}

        <div className="popup-actions">
          <button
            className="popup-delete"
            onClick={() => {
              onDelete(box.id);
              onClose();
            }}
          >
            Delete
          </button>

          <button
            className="popup-save"
            onClick={onClose}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
