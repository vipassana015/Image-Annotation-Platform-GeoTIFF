import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import api from "../api/axios";
import "../pages/Dashboard.css";

const API = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

function ProjectCard({ project, username, onDelete }) {
  const navigate = useNavigate();

  

  const formattedDate = project.last_edited
    ? new Date(project.last_edited).toLocaleDateString("en-GB")
    : "N/A";

  const userInitial = username ? username.charAt(0).toUpperCase(): "U";

  const members = project.members || [];

const visibleMembers = members.slice(0, 3);
const extraCount = members.length - visibleMembers.length;


 

  return (
    <div
      className="project-card"
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{ cursor: "pointer" }}
    >
      {/* DELETE BUTTON */}
      <button
        className="project-delete-btn"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project.id); 
        }}
      >
        <Trash2 size={16} />
      </button>

      <div className="project-thumbnail-container">
        <img
          src={
            project.thumbnail_url
              ? `${API}${project.thumbnail_url}`
              : "/placeholder.jpg"
          }
          alt={project.name}
          className="project-thumbnail"
        />
      </div>

      <div className="card-divider"></div>

      <div className="project-info">
        <div className="project-header">
          <h3>{project.name || "Project Name"}</h3>
         <div
  className="user-avatar-group icon-wrapper"
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}/members`);
  }}
>
  {/* avatars */}
  {visibleMembers.map((member, index) => (
    <div
      key={member.id}
      className="user-avatar"
      style={{ zIndex: visibleMembers.length - index }}
    >
      {member.initial}
    </div>
  ))}

  {extraCount > 0 && (
    <div className="user-avatar extra">+{extraCount}</div>
  )}

  {/* 🔥 TOOLTIP */}
  <div className="tooltip">
    View all {members.length} members
  </div>
</div>
        </div>
        <p>No. of Images: {project.image_count || 0}</p>
        <p>Last Edited: {formattedDate}</p>
      </div>

    
    </div>
  );
}

export default ProjectCard;