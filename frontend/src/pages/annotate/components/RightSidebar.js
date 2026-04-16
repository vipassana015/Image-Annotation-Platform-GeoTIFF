import ImageMetadataPanel from "./ImageMetadataPanel";
import { useRef, useEffect, useState, } from "react";

export default function RightSidebar({
  boxes,
  selectedBoxId,
  setSelectedBoxId,
  setHoveredBoxId, 
  classes,
  index,
}) {


const [search, setSearch] = useState("");

const getClassCount = (classId) => {
  return boxes.filter((b) => b.class_label === classId).length;
};
  const annotationRefs = useRef({});

  useEffect(() => {
    if (selectedBoxId && annotationRefs.current[selectedBoxId]) {
      annotationRefs.current[selectedBoxId].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedBoxId]);

  const getClassName = (classId) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : "Unassigned";
  };

  const getClassColor = (classId) => {
  const cls = classes.find((c) => c.id === classId);
  return cls ? cls.color : "#9ca3af"; 
};

const filteredClasses = classes.filter((c) =>
  c.name.toLowerCase().includes(search.toLowerCase())
);

/*-----------Class Reuse-------------*/

const usedClassIds = boxes
  .map((b) => b.class_label)
  .filter(Boolean);

const usedClasses = filteredClasses.filter((c) =>
  usedClassIds.includes(c.id)
);

const unusedClasses = filteredClasses.filter(
  (c) => !usedClassIds.includes(c.id)
);


  return (
    <div className="right-sidebar">
      <div className="annotate-sidebar">

        {/* CLASSES */}
        <section className="sidebar-section">
          <h4 className="sidebar-title">
            Classes ({classes.length})
          </h4>

          <div className="sidebar-divider" />

          <input
  className="class-search"
  placeholder="Search classes..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

          {classes.length === 0 && (
            <div className="sidebar-empty">
              No classes created
            </div>
          )}
          
          
          <div className="classes-list">

  {/* 🔹 USED CLASSES */}
  {usedClasses.length > 0 && (
    <>
      <div className="class-group-title">
        Used in this image
      </div>

      {usedClasses.map((c) => (
        <div key={c.id} className="class-item">
          <span
            className="class-color"
            style={{ background: c.color || "#60a5fa" }}
          />
          <span className="class-label">
            {c.name} ({getClassCount(c.id)})
          </span>
        </div>
      ))}
    </>
  )}

  {/* 🔹 UNUSED CLASSES */}
  {unusedClasses.length > 0 && (
    <>
      <div className="class-group-title muted">
        All classes
      </div>

      {unusedClasses.map((c) => (
        <div key={c.id} className="class-item">
          <span
            className="class-color"
            style={{ background: c.color || "#60a5fa" }}
          />
          <span className="class-label">
            {c.name}
          </span>
        </div>
      ))}
    </>
  )}

</div>
        </section>

        {/* ANNOTATIONS */}
        <section className="sidebar-section">
          <h4 className="sidebar-title">
            Annotations ({boxes.length})
          </h4>

          <div className="sidebar-divider" />

          {boxes.length === 0 && (
            <div className="sidebar-empty">
              No annotations yet
            </div>
          )}

          {boxes.map((box, index) => {
            const label = getClassName(box.class_label);
            const color = getClassColor(box.class_label);

            return (
              <div
                key={box.id}
                ref={(el) => (annotationRefs.current[box.id] = el)}
                className={`annotation-item ${
                  box.id === selectedBoxId ? "active" : ""
                }`}
                onClick={() => setSelectedBoxId(box.id)}
                 onMouseEnter={() => setHoveredBoxId(box.id)}  
  onMouseLeave={() => setHoveredBoxId(null)}  
              >
                <span className="annotation-id">#{index + 1}</span>

                <span
                  className="class-color"
                  style={{ background: color }}
                />

                <span
                  className={
                    label === "Unassigned"
                      ? "annotation-label unassigned"
                      : "annotation-label"
                  }
                >
                  {label}
                </span>
              </div>
            );
          })}
        </section>

        {/* IMAGE METADATA */}
        <ImageMetadataPanel />
      </div>
    </div>
  );
}