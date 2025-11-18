import React, { useState } from "react";
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

function Sidebar({ username }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Projects");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const userInitial = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div className="sidebar">
      {/* USER DROPDOWN SECTION */}
      <div className="user-section">
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
          className={`menu-item ${activeMenu === "Projects" ? "active" : ""}`}
          onClick={() => setActiveMenu("Projects")}
        >
          <FolderKanban size={16} /> Projects
        </div>
        <div
          className={`menu-item ${activeMenu === "Admin" ? "active" : ""}`}
          onClick={() => setActiveMenu("Admin")}
        >
          <LayoutDashboard size={16} /> Admin View
        </div>
        <div
          className={`menu-item ${activeMenu === "Notifications" ? "active" : ""}`}
          onClick={() => setActiveMenu("Notifications")}
        >
          <Bell size={16} /> Notifications
        </div>
      </div>

      <hr className="divider" />

      {/* MIDDLE MENU */}
      <div className="menu-middle">
        <div
          className={`menu-item ${activeMenu === "Team" ? "active" : ""}`}
          onClick={() => setActiveMenu("Team")}
        >
          <Users size={16} /> Team Projects
        </div>
      </div>

      {/* BOTTOM MENU */}
      <div className="menu-bottom">
        <div
          className={`menu-item ${activeMenu === "Trash" ? "active" : ""}`}
          onClick={() => setActiveMenu("Trash")}
        >
          <Trash2 size={16} /> Trash
        </div>
        <div
          className={`menu-item ${activeMenu === "Help" ? "active" : ""}`}
          onClick={() => setActiveMenu("Help")}
        >
          <HelpCircle size={16} /> Help / Support
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
