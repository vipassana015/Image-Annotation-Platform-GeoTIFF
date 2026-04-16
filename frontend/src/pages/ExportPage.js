import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../api/axios";
import ProjectSidebarLayout from "../components/ProjectSidebarLayout";
import "./ExportPage.css";
import { ChevronDown } from "lucide-react";

export default function ExportPage() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [format, setFormat] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const projectName = project?.name || "Project";



  useEffect(() => {
  const closeDropdown = () => setDropdownOpen(false);
  window.addEventListener("click", closeDropdown);

  return () => window.removeEventListener("click", closeDropdown);
}, []);

  // 🔹 Fetch Project
  useEffect(() => {
    const fetchProject = async () => {
      const res = await api.get(`/api/projects/${projectId}/`);
      setProject(res.data);
    };
    fetchProject();
  }, [projectId]);

  // 🔹 Fetch Datasets for Project
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get(`/api/datasets/?project_id=${projectId}`);
        setDatasets(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDatasets();
  }, [projectId]);

  const handleExport = async () => {
  try {
    if (!selectedDataset) {
      alert("Please select a dataset");
      return;
    }

    if (!format) {
      alert("Please select a format");
      return;
    }

    const token = localStorage.getItem("access_token");

    const response = await fetch(
      `http://127.0.0.1:8000/api/datasets/${selectedDataset.id}/export/?format=${format}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Export failed");

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedDataset.name}_${format}.zip`;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Export failed");
  }
};

  if (!project) return null;

  return (
    <ProjectSidebarLayout
      project={project}
      projectId={projectId}
      activeTab="export"
    >
     <div className="export-main">

        <div className="upload-header-left">
  <div className="breadcrumb-row">
    <span className="project-name-bc">{projectName}</span>
    <span className="bc-sep">›</span>
    <span className="current-tab">Export</span>
  </div>
</div>

<div className="export-section dataset-section">

  <div className="section-title">Dataset</div>

  <div className="dropdown-wrapper">

    <div
      className="custom-dropdown"
      onClick={(e) => {
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
      }}
    >
      {selectedDataset
        ? `${selectedDataset.name} (${selectedDataset.image_count})`
        : "Select dataset"}
    </div>

    {dropdownOpen && (
      <div className="dropdown-menu">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="dropdown-item"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDataset(ds);
              setDropdownOpen(false);
            }}
          >
            {ds.name} ({ds.image_count})
          </div>
        ))}
      </div>
    )}

  </div>

</div>

{/* ===== FORMAT SECTION ===== */}
<div className="export-section format-section">

  <div className="section-title">Format</div>

  <div className="format-options">
    <div
      className={`format-btn ${format === "yolo" ? "active" : ""}`}
      onClick={() => setFormat("yolo")}
    >
      YOLO
    </div>

    <div
      className={`format-btn ${format === "coco" ? "active" : ""}`}
      onClick={() => setFormat("coco")}
    >
      COCO
    </div>
  </div>

</div>


{/* ===== EXPORT BUTTON ===== */}
<div className="export-section">
  <button
  className="export-btn"
  onClick={handleExport}
  disabled={!selectedDataset || !format}
>
  Export
</button>
</div>

        

      </div>
    </ProjectSidebarLayout>
  );
}