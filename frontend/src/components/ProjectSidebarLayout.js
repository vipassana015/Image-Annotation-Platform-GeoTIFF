import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import {
    FolderKanban,
    LayoutDashboard,
    Bell,
    Users,
    Trash2,
    HelpCircle,
    ArrowLeft,
    FileUp,
    Image,
    Layers,
    PackageSearch,
    Tags,
    LogOut,
    Settings,
    Moon
} from "lucide-react";
import userIcon from "../images/user.png";

export default function ProjectSidebarLayout({
    children,
    project,
    projectId,
    }) {
    
    const API = "http://127.0.0.1:8000"; 
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("recent");

    const [username, setUsername] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const userInitial = username ? username.charAt(0).toUpperCase() : "U";
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const dropdownRef = useRef();
    
useEffect(() => {
    if (location.state?.activeTab) {
        setActiveTab(location.state.activeTab);}
    }, [location.state]);

/*------------------Fetch Username----------------*/
useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (!token) return;

  fetch("http://127.0.0.1:8000/api/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(data => setUsername(data.username))
    .catch(() => {});
}, []);

const handleLogout = () => {
  localStorage.clear();
  navigate("/login");
};

useEffect(() => {
  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

    return (
        <div className="upload-container">

        {/* ================= Sidebar ================= */}
        <div className="sidebar upload-sidebar">
            <div className="sidebar-columns">

            {/* ICON BAR */}
            <div className="sidebar-icons">
                <div className="icon-stack" ref={dropdownRef}>
               <div className="user-initial-circle small"
               onClick={() => setDropdownOpen(!dropdownOpen)}
               style={{ cursor: "pointer" }}>
                {userInitial}
                </div>

                {dropdownOpen && (
  <div className="dropdown-panel">
    <div className="profile-section">
      <img src={userIcon} alt="User" className="profile-img-centered" />
      <p className="user-name">{username || "Username"}</p>
      <p className="user-email">abc123@gmail.com</p>
    </div>

    <div className="dropdown-options">
      <div className="dropdown-item">
        <Settings size={16} />
        <span>Settings</span>
      </div>
      <div
        className="dropdown-item"
        onClick={() => setDarkMode(!darkMode)}
      >
        <Moon size={16} />
        <span>Theme</span>
      </div>
    </div>

    <hr className="divider" />

    <div className="dropdown-item logout" onClick={handleLogout}>
      <LogOut size={16} />
      <span>Sign Out</span>
    </div>
  </div>
)}

<div className="icon-wrapper">
  <div
    className="icon-btn"
    onClick={() => navigate("/dashboard/recent")}
  >
    <FolderKanban size={18} />
  </div>
  <span className="tooltip">Projects</span>
</div>

<div className="icon-wrapper">
  <div
    className="icon-btn"
    onClick={() => navigate("/dashboard/activity")}
  >
    <LayoutDashboard size={18} />
  </div>
  <span className="tooltip">Activity</span>
</div>

<div className="icon-wrapper">
  <div
    className="icon-btn"
    onClick={() => navigate("/dashboard/notifications")}
  >
    <Bell size={18} />
  </div>
  <span className="tooltip">Notifications</span>
</div>

<div className="icon-wrapper">
  <div
    className="icon-btn"
    onClick={() => navigate("/dashboard/shared")}
  >
    <Users size={18} />
  </div>
  <span className="tooltip">Shared</span>
</div>

<div className="icon-wrapper">
  <div
    className="icon-btn"
    onClick={() => navigate("/dashboard/trash")}
  >
    <Trash2 size={18} />
  </div>
  <span className="tooltip">Trash</span>
</div>

<div className="icon-wrapper">
  <div
    className="icon-btn"
    onClick={() => navigate("/dashboard/help")}
  >
    <HelpCircle size={18} />
  </div>
  <span className="tooltip">Help</span>
</div>
                </div>
            </div>

            {/* EXPANDED SIDEBAR */}
            <div className="sidebar-content">

                {/* BACK */}
                <div
                className="back-btn"
                onClick={() => navigate("/dashboard/recent")}
                >
                <ArrowLeft size={16} />
                </div>

                {/* PROJECT PREVIEW */}
                <div className="project-preview">
                <div className="thumbnail-box">
                    <img
                    src={
                        project?.thumbnail_url
                        ? `${API}${project.thumbnail_url}`
                        : "https://via.placeholder.com/600x360"
                    }
                    alt={project?.name}
                    className="project-thumbnail"
                    />
                </div>
                <p className="project-name">{project?.name}</p>
                </div>

                {/* MENU */}
                <div className="menu-top">

                <div
                    className={`menu-item ${activeTab === "upload" ? "active" : ""}`}
                    onClick={() =>
                    navigate(`/projects/${projectId}/upload`)
                    }
                >
                    <FileUp size={16} /> Upload
                </div>

                <div
                    className={`menu-item ${activeTab === "annotate" ? "active" : ""}`}
                    onClick={() =>
                    navigate(`/projects/${projectId}/annotate`)
                    }
                >
                    <Image size={16} /> Annotate
                </div>

                <div
                    className={`menu-item ${activeTab === "datasets" ? "active" : ""}`}
                    onClick={() =>
                    navigate(`/projects/${projectId}/datasets`)
                    }
                >
                    <Layers size={16} /> Datasets
                </div>

                <div
    className={`menu-item ${activeTab === "export" ? "active" : ""}`}
    onClick={() =>
        navigate(`/projects/${projectId}/export`)
    }
    >
    <PackageSearch size={16} /> Export
    </div>

                <div className="menu-item">
                    <Tags size={16} /> Classes
                </div>

                <div
    className={`menu-item ${activeTab === "members" ? "active" : ""}`}
    onClick={() =>
        navigate(`/projects/${projectId}/members`)
    }
    >
    <Users size={16} /> Members
    </div>

                </div>
            </div>
            </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="upload-main">
    {children}
    </div>

        </div>
    );
    }