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
