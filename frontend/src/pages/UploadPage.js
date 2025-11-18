import React, { useState } from "react";
import {
  Upload,
  Folder,
  HelpCircle,
  Image,
  Layers,
  Trash2,
  Bell,
  Users,
  LayoutDashboard,
  FileUp,
  PackageSearch,
  Tags,
  ArrowLeft,
  FolderKanban,
} from "lucide-react";
import "../pages/Dashboard.css";

function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [activeIcon, setActiveIcon] = useState("projects"); // Left collapsed sidebar
  const [activeTab, setActiveTab] = useState("upload"); // Right expanded sidebar

  // temp project name until you wire real data
  const projectName = "Project 1";

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    console.log("Dropped files:", files);
    // TODO: upload files to backend
  };

  // helper to set both right tab and left icon (keeps UI in sync)
  const selectTab = (tabName) => {
    setActiveTab(tabName);
    setActiveIcon("projects");
  };

  return (
    <div className="upload-container">
      {/* Sidebar */}
      <div className="sidebar upload-sidebar">
        <div className="sidebar-columns">
          {/* LEFT COLUMN — Collapsed icon bar */}
          <div className="sidebar-icons">
            <div className="icon-stack">
              {/* User Circle */}
              <div
                className={`user-initial-circle small ${
                  activeIcon === "user" ? "active" : ""
                }`}
                onClick={() => setActiveIcon("user")}
                title="User"
              >
                U
              </div>

              {/* Projects */}
              <div
                className={`icon-btn ${activeIcon === "projects" ? "active" : ""}`}
                onClick={() => setActiveIcon("projects")}
                title="Projects"
              >
                <FolderKanban size={18} />
              </div>

              {/* Admin View */}
              <div
                className={`icon-btn ${activeIcon === "admin" ? "active" : ""}`}
                onClick={() => setActiveIcon("admin")}
                title="Admin View"
              >
                <LayoutDashboard size={18} />
              </div>

              {/* Notifications */}
              <div
                className={`icon-btn ${activeIcon === "notifications" ? "active" : ""}`}
                onClick={() => setActiveIcon("notifications")}
                title="Notifications"
              >
                <Bell size={18} />
              </div>

              {/* Team Projects */}
              <div
                className={`icon-btn ${activeIcon === "team" ? "active" : ""}`}
                onClick={() => setActiveIcon("team")}
                title="Team Projects"
              >
                <Users size={18} />
              </div>

              {/* Trash */}
              <div
                className={`icon-btn ${activeIcon === "trash" ? "active" : ""}`}
                onClick={() => setActiveIcon("trash")}
                title="Trash"
              >
                <Trash2 size={18} />
              </div>

              {/* Help / Support */}
              <div
                className={`icon-btn ${activeIcon === "help" ? "active" : ""}`}
                onClick={() => setActiveIcon("help")}
                title="Help / Support"
              >
                <HelpCircle size={18} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Detailed sidebar */}
          <div className="sidebar-content">
            {/* Back Button */}
            <div
              className="back-btn"
              onClick={() => (window.location.href = "/dashboard")}
              role="button"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={16} />
            </div>

            {/* Project Thumbnail Section */}
            <div className="project-preview">
              <div className="thumbnail-box">
                <img
                  src="https://via.placeholder.com/600x360"
                  alt="Project Thumbnail"
                  className="project-thumbnail"
                />
              </div>
              <p className="project-name">{projectName}</p>
            </div>

            {/* Data Lab Tabs */}
            <div className="menu-top">
              <div
                className={`menu-item ${activeTab === "upload" ? "active" : ""}`}
                onClick={() => selectTab("upload")}
              >
                <FileUp size={16} /> Upload Data
              </div>

              <div
                className={`menu-item ${activeTab === "annotate" ? "active" : ""}`}
                onClick={() => selectTab("annotate")}
              >
                <Image size={16} /> Annotate
              </div>

              <div
                className={`menu-item ${activeTab === "datasets" ? "active" : ""}`}
                onClick={() => selectTab("datasets")}
              >
                <Layers size={16} /> Datasets
              </div>

              <div
                className={`menu-item ${activeTab === "export" ? "active" : ""}`}
                onClick={() => selectTab("export")}
              >
                <PackageSearch size={16} /> Export
              </div>

              <div
                className={`menu-item ${activeTab === "classes" ? "active" : ""}`}
                onClick={() => selectTab("classes")}
              >
                <Tags size={16} /> Classes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Upload Area */}
      <div className="upload-main">
        {/* Left-aligned breadcrumb/header */}
        <div className="upload-header-left">
          <div className="breadcrumb-row">
            <span className="project-name-bc">{projectName}</span>
            <span className="bc-sep">›</span>
            <span className="current-tab">
              {activeTab === "upload"
                ? "Upload Data"
                : activeTab === "annotate"
                ? "Annotate"
                : activeTab === "datasets"
                ? "Datasets"
                : activeTab === "export"
                ? "Export"
                : "Classes"}
            </span>
          </div>
        </div>

        {/* Drag & Drop Section (only for upload tab) */}
        {activeTab === "upload" && (
          <div
            className={`upload-dropzone ${dragActive ? "active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <p>Drag and drop files to upload</p>
            <div className="upload-buttons">
              <button className="upload-btn">
                <Upload size={16} /> Select File(s)
              </button>
              <button className="upload-btn">
                <Folder size={16} /> Select Folder
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "upload" && (
          <div style={{ marginTop: "100px", color: "#aaa" }}>
            <p>
              Coming soon:{" "}
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
