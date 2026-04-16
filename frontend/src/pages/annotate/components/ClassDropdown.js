import { useState, useRef, useEffect } from "react";

export default function ClassDropdown({
  value,
  classes,
  items,
  onCreateClass,
  onCreate,
  onChange,
  createLabel = "+ Create New",
  placeholder = "Enter name", 
  label = "Select"
}) {
  
  const [createdItem, setCreatedItem] = useState(null);
  const baseData = items || classes || [];
const data = createdItem ? [...baseData, createdItem] : baseData;
  const handleCreate = onCreate || onCreateClass;

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  

  const selectedClass = data.find(
  (c) => String(c.id) === String(value)
);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  // Focus input when creating
  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

const handleCreateClass = async () => {
  if (!newClassName.trim()) return;

  const created = await handleCreate(newClassName.trim());

  if (created) {
    setCreatedItem(created);     // 🔥 ADD THIS
    onChange(created.id);        // select it immediately
  }

  setNewClassName("");
  setIsCreating(false);
  setIsOpen(false);
};

  return (
    <div
      className="class-dropdown"
      ref={containerRef}
    >
      <button
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}

        onKeyDown={(e)=>{
 if(e.key==="Enter") setIsOpen(!isOpen)
}}
      >
        {selectedClass?.name || label}
        <span className="dropdown-arrow">▾</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
                <div className="dropdown-list">
    {data.map((c) => (
      <div
        key={c.id}
        className="dropdown-item"
        onClick={() => {
          onChange(c.id);
          setIsOpen(false);
        }}
      >
        {c.name}
      </div>
    ))}
  </div>

  {/* 🔥 FIXED FOOTER */}
  <div className="dropdown-footer">
    {!isCreating ? (
      <div
        className="dropdown-create"
        onClick={() => setIsCreating(true)}
      >
        {createLabel}
      </div>
    ) : (
      <input
        ref={inputRef}
        className="dropdown-input"
        value={newClassName}
        onChange={(e) => setNewClassName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreateClass();
          if (e.key === "Escape") setIsCreating(false);
        }}
        placeholder={placeholder}
      />
    )}
  </div>
        </div>
      )}
    </div>
  );
}
