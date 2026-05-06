import React, { useEffect, useRef, useState } from "react";
import "../pages/AnnotatePage.css";

function SortDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="sort-wrapper" ref={ref}>
      <button
        className="sort-by"
        onClick={() => setOpen(prev => !prev)}
      >
        Sort by: {value.label}
      </button>

      {open && (
        <div className="sort-dropdown">
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortDropdown;
