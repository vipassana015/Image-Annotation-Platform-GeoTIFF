import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import {
    LogOut,
    Settings,
    Bell,
    Trash2,
    HelpCircle,
    Moon,
    Users,
    LayoutDashboard,
    FolderKanban,
    ChevronDown,
  } from "lucide-react";
  import userIcon from "../images/user.png";
  import "../pages/Dashboard.css";

 function Sidebar({ username, setActiveTab, activeTab, unreadCount  }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const dropdownRef = useRef();

    const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.clear();
      window.location.href = "/login";
    };

    const userInitial = username ? username.charAt(0).toUpperCase() : "U";

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
      <div className="sidebar">
        {/* USER DROPDOWN SECTION */}
        <div className="user-section" ref={dropdownRef}>
          <button
          className={`username-btn no-bg ${dropdownOpen ? "active" : ""}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          >
              <div className="user-initial-circle">{userInitial}</div>
              <span>{username || "User"} <ChevronDown /></span>
          </button>

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
        </div>

        {/* MAIN MENU */}
        <div className="menu-top">
          <div
            className={`menu-item ${activeTab === "recent" ? "active" : ""}`}
            onClick={() => navigate("/dashboard/recent")}
          >
            <FolderKanban size={16} /> Projects
          </div>
          <div
            className={`menu-item ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => navigate("/dashboard/activity")}
          >
            <LayoutDashboard size={16} /> Activity
          </div>
          <div
  className={`menu-item ${activeTab === "notifications" ? "active" : ""}`}
 onClick={() => navigate("/dashboard/notifications")}
>
  <Bell size={16} /> Notifications

  {unreadCount > 0 && (
    <span className="badge">{unreadCount}</span>
  )}
</div>
        </div>

        <hr className="divider" />

        {/* MIDDLE MENU */}
        <div className="menu-middle">
          <div
          className={`menu-item ${activeTab === "shared" ? "active" : ""}`}
         onClick={() => navigate("/dashboard/shared")}>
  <Users size={16} /> Shared with Me
</div>
        </div>

        {/* BOTTOM MENU */}
        <div className="menu-bottom">
          <div
            className={`menu-item ${activeTab === "trash" ? "active" : ""}`}
           onClick={() => navigate("/dashboard/trash")}
          >
            <Trash2 size={16} /> Trash
          </div>
          <div
            className={`menu-item ${activeTab === "help" ? "active" : ""}`}
           onClick={() => navigate("/dashboard/help")}
          >
            <HelpCircle size={16} /> Help / Support
          </div>
        </div>
      </div>
    );
  }

  export default Sidebar;
