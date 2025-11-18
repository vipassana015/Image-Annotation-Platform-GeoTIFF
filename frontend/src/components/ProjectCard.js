import React from "react";
import "../pages/Dashboard.css";

function ProjectCard({ project, username }) {
  const formattedDate = project.last_edited
    ? new Date(project.last_edited).toLocaleDateString("en-GB")
    : "N/A";
  const userInitial = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div className="project-card">
      <div className="project-thumbnail-container">
        <img
          src={project.thumbnail || "/placeholder.jpg"}
          alt={project.name}
          className="project-thumbnail"
        />
      </div>

      <div className="card-divider"></div>

      <div className="project-info">
        <div className="project-header">
          <h3>{project.name || "Project Name"}</h3>
          <div className="user-icon">{userInitial}</div>
        </div>
        <p>No. of Images: {project.image_count || 0}</p>
        <p>Last Edited: {formattedDate}</p>
      </div>
    </div>
  );
}

export default ProjectCard;
