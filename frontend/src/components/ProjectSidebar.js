import {
  Image,
  Layers,
  FileUp,
  PackageSearch,
  Tags,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProjectSidebar({ project, projectId, activeTab }) {
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

  return (
    <div className="sidebar-content">

      {/* Back Button */}
      <div className="back-btn" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={16} />
      </div>

      {/* Project Info */}
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

      {/* Menu */}
      <div className="menu-top">

        <div
          className={`menu-item ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => navigate(`/project/${projectId}/annotate`, {
  state: { projectName: project.name }
})}
        >
          <FileUp size={16} /> Upload 
        </div>

        <div
          className={`menu-item ${activeTab === "annotate" ? "active" : ""}`}
          onClick={() => navigate(`/projects/${projectId}/annotate`)}
        >
          <Image size={16} /> Annotate
        </div>

        <div
  className={`menu-item ${activeTab === "datasets" ? "active" : ""}`}
  onClick={() => navigate(`/project/${projectId}/datasets`, {
    state: { projectName: project.name }
  })}
>
  <Layers size={16} /> Datasets
</div>

        <div
  className={`menu-item ${activeTab === "export" ? "active" : ""}`}
  onClick={() => navigate(`/project/${projectId}/export`, {
    state: { projectName: project.name }
  })}
>
  <PackageSearch size={16} /> Export
</div>
<div
  className={`menu-item ${activeTab === "classes" ? "active" : ""}`}
  onClick={() => navigate(`/projects/${projectId}/classes`, {
  state: { projectName: project.name }
  })}
>
  <Tags size={16} /> Classes
</div>

      </div>
    </div>
  );
}

export default ProjectSidebar;