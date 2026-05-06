import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SortDropdown from "../components/SortDropdown";
import ProjectSidebarLayout from "../components/ProjectSidebarLayout";  
import api from "../api/axios";
import "./DatasetsPage.css";
import {Trash2} from "lucide-react";

export default function DatasetsPage() {
  const { projectId } = useParams();
  const [datasets, setDatasets] = useState([]);
  const [project, setProject] = useState(null);
  const navigate = useNavigate();
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  
  const DATASET_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },];
  const [datasetSort, setDatasetSort] = useState(DATASET_SORT_OPTIONS[0]);
   
  const sortedDatasets = [...datasets].sort((a, b) => {
  switch (datasetSort.value) {
    case "newest":
      return new Date(b.created_at) - new Date(a.created_at);
    case "oldest":
      return new Date(a.created_at) - new Date(b.created_at);
    case "name-asc":
      return a.name.localeCompare(b.name);
    case "name-desc":
      return b.name.localeCompare(a.name);
    default:
      return 0;
  }
});


  useEffect(() => {
  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/projects/${projectId}/`);
      setProject(res.data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    }
  };

  fetchProject();
}, [projectId]);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get(
          `/api/datasets/?project_id=${projectId}`
        );
        setDatasets(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDatasets();
  }, [projectId]);

const handleDatasetDelete = (id) => {
  setDatasetToDelete(id);
};

const confirmDatasetDelete = async () => {
  try {
    await api.delete(`/api/datasets/${datasetToDelete}/delete/`);

    setDatasets((prev) =>
      prev.filter((d) => d.id !== datasetToDelete)
    );

    setDatasetToDelete(null);

  } catch (err) {
    console.error("Dataset delete failed", err);
  }
};

if (!project) return null;

return (
  <ProjectSidebarLayout
    project={project}          // you may fetch this
    projectId={projectId}
    activeTab="datasets"
  >
    <div className="annotate-main">

        {/* ---------- Breadcrumb ---------- */}
<div className="upload-header-left">
  <div className="breadcrumb-row">
    <span className="project-name-bc">{project.name}</span>
    <span className="bc-sep">›</span>
    <span className="current-tab">Datasets</span>
  </div>
</div>

      <div className="annotate-content">
        <div className="batch-list-header">


  <SortDropdown
    value={datasetSort}
    options={DATASET_SORT_OPTIONS}
    onChange={setDatasetSort}
  />
</div>
        <div className="annotate-batch-section">

          <div className="batch-list">
            {sortedDatasets.map((dataset) => (
              <div
  className="batch-card"
  key={dataset.id}
  onClick={() =>
   navigate(`/projects/${projectId}/datasets/${dataset.id}`, {
  state: {
    datasetName: dataset.name,
  },
})
  }
>
    <button
  className="dataset-delete-btn"
  onMouseDown={(e) => e.stopPropagation()}
  onClick={(e) => {
    e.stopPropagation();
    handleDatasetDelete(dataset.id);
  }}
>
  <Trash2 size={16} />
</button>
                
                <div className="batch-thumb">
                  <div className="thumb-box">
  {dataset.thumbnail_url ? (
    <img
      src={
        dataset.thumbnail_url.startsWith("http")
          ? dataset.thumbnail_url
          : `http://127.0.0.1:8000${dataset.thumbnail_url}`
      }
      alt={dataset.name}
      className="project-thumbnail"
    />
  ) : (
    <div className="thumb-placeholder">No Image</div>
  )}
</div>
                </div>

                <div className="batch-content">
                  <div className="batch-header">
                    <strong>{dataset.name}</strong>
                  </div>

                  <div className="batch-meta">
                    Created on {new Date(dataset.created_at).toLocaleDateString()}
                  </div>

                  <div className="batch-counts">
                    {dataset.image_count} images
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
{datasetToDelete && (
  <div className="modal-overlay">
    <div className="modal-box">
      <p>Delete this dataset?</p>

      <div className="modal-actions">
        <button onClick={() => setDatasetToDelete(null)}>Cancel</button>
        <button onClick={confirmDatasetDelete}>Delete</button>
      </div>
    </div>
  </div>
)}
    </div>
  </ProjectSidebarLayout>
);
}