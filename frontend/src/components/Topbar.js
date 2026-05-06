import React from "react";

function Topbar({ 
  onCreate, 
  setActiveTab, 
  activeTab, 
  sortComponent,
  searchQuery,
  setSearchQuery
}) {
  return (
    <div className="topbar">
      <h2>Projects</h2>

      <div className="topbar-controls">
        <div className="topbar-left">
          <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="filter-section">
            {activeTab !== "activity" && activeTab !== "notifications" && (
              <div className="filter-buttons">
                <button
                  className={activeTab === "recent" ? "active" : ""}
                  onClick={() => setActiveTab("recent")}
                >
                  Recently Viewed
                </button>

                <button
                  className={activeTab === "all" ? "active" : ""}
                  onClick={() => setActiveTab("all")}
                >
                  All Projects
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="topbar-right">
          <button className="create-project" onClick={onCreate}>
            + Create Project
          </button>

          {sortComponent}
        </div>
      </div>
    </div>
  );
}

export default Topbar;