import React, { useState } from "react";

function Topbar({ onCreate }) {
  const [activeFilter, setActiveFilter] = useState("Recently");

  return (
    <div className="topbar">
      <h2>Projects</h2>
      <div className="topbar-controls">
        <div className="topbar-left">
          <input type="text" placeholder="Search projects..." />

          <div className="filter-section">
           <div className="filter-buttons">
            <button
              className={activeFilter === "Recently" ? "active" : ""}
              onClick={() => setActiveFilter("Recently")}
            >
              Recently Viewed
            </button>
            <button
              className={activeFilter === "Shared" ? "active" : ""}
              onClick={() => setActiveFilter("Shared")}
            >
              Shared Projects
            </button>
          </div>
        </div>
      </div>

        <div className="topbar-right">
          <button className="create-project"  onClick={onCreate}>+ Create Project</button>
          <button className="sort-by">Sort By</button>
          <button className="view-by">View By</button>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
