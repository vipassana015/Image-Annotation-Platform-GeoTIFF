import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
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
  Circle,
  CheckCircle,
  Filter,
} from "lucide-react";
import "./AnnotatePage.css";
import SortDropdown from "../components/SortDropdown";
import AnnotateWorkspace from "./annotate/components/AnnotateWorkspace";
import ProjectSidebarLayout from "../components/ProjectSidebarLayout";  



function AnnotatePage() {

  const { projectId, batchId, imageId } = useParams();
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState("unannotated");
  const [imageToDelete, setImageToDelete] = useState(null);
  const [batchToDelete, setBatchToDelete] = useState(null);

  const location = useLocation();

  const selectedBatch = batches.find(
  b => String(b.id) === String(batchId));

  const selectedImage = images.find(
  img => String(img.id) === String(imageId));

  const totalCount = selectedBatch?.file_count || 0;

  const imageUrl = selectedImage
  ? `${API}${selectedImage.thumbnail_url}`
  : null;

  const handleDeleteClick = (id) => {
  setImageToDelete(id);
};

const fetchBatches = async () => {
  try {
    setLoadingBatches(true);

    const res = await axios.get(
      `${API}/api/projects/${projectId}/batches/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    setBatches(res.data);
  } catch (err) {
    console.error("Failed to load batches", err);
  } finally {
    setLoadingBatches(false);
  }
};

const confirmDelete = async () => {
  try {
    await fetch(`${API}/api/images/${imageToDelete}/delete/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    // ✅ remove from UI
    setImages((prev) => prev.filter((img) => img.id !== imageToDelete));

    setImageToDelete(null);
  } catch (err) {
    console.error("Delete failed", err);
  }
};

const handleBatchDeleteClick = (id) => {
  setBatchToDelete(id);
};

const confirmBatchDelete = async () => {
  try {
    await fetch(`${API}/api/batches/${batchToDelete}/delete/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    // remove batch from UI
    setBatches((prev) => prev.filter((b) => b.id !== batchToDelete));

    setBatchToDelete(null);
  } catch (err) {
    console.error("Batch delete failed", err);
  }
};

const IMAGE_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
];

const BATCH_SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
];

 const [imageSort, setImageSort] = useState(IMAGE_SORT_OPTIONS[0]);
 const [batchSort, setBatchSort] = useState(BATCH_SORT_OPTIONS[0]);

  const filteredImages = images
  .filter(img => {
    const annotated = img.is_annotated === true;
    return filter === "annotated" ? annotated : !annotated;
  })
  .sort((a, b) => {
    switch (imageSort.value) {
      case "newest":
        return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      case "oldest":
        return new Date(a.uploaded_at) - new Date(b.uploaded_at);
      case "name-asc":
        return a.filename.localeCompare(b.filename);
      case "name-desc":
        return b.filename.localeCompare(a.filename);
      default:
        return 0;
    }
  });

  const sortedBatches = [...batches].sort((a, b) => {
    switch (batchSort.value) {
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

  /* ---------------- Fetch Project ---------------- */
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API}/api/projects/${projectId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setProject(res.data);
      } catch (err) {
        console.error("Failed to load project", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, API]);

  /* ---------------- Fetch Batches ---------------- */
useEffect(() => {
  fetchBatches();
}, [projectId, location.pathname]);

  /* ---------------- Fetch Images for Selected Batch ---------------- */
useEffect(() => {
  if (!batchId) return;

  const fetchImages = async () => {
    try {
      const res = await axios.get(
        `${API}/api/projects/${projectId}/batches/${batchId}/files/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setImages(res.data);
    } catch (err) {
      console.error("Failed to load batch images", err);
      setImages([]);
    }
  };

  fetchImages();
}, [batchId, projectId]);


  /* ---------------- Loading States ---------------- */
  if (loading) {
    return <div style={{ padding: 40, color: "#aaa" }}>Loading project…</div>;
  }

  if (!project) {
    return <div style={{ padding: 40, color: "#aaa" }}>Project not found.</div>;
  }

console.log("batchId:", batchId);
console.log("imageId:", imageId);
console.log("images:", images);
console.log("selectedImage:", selectedImage);

const annotatedCount = images.filter(i => i.is_annotated).length;
const unannotatedCount = images.filter(i => !i.is_annotated).length;


  return (
    <ProjectSidebarLayout
      project={project}          // you may fetch this
      projectId={projectId}
      activeTab="annotate"
    >
    {/* ================= Main Content ================= */}
    <div className="annotate-main">
      {/* ---------- Breadcrumb ---------- */}
      <div className="upload-header-left">
        <div className="breadcrumb-row">
          <span className="project-name-bc">{project.name}</span>
          <span className="bc-sep">›</span>
          <span className="current-tab">Annotate</span>
        </div>
      </div>

      {/* ================== BATCH OVERVIEW ==================== */}
    {!batchId && (
    <div className="annotate-content">
     <div className="batch-page-wrapper">
        <div className="batch-list-header">
  <div />
  <SortDropdown
    value={batchSort}
    options={BATCH_SORT_OPTIONS}
    onChange={setBatchSort}
  />
</div>

    <div className="annotate-batch-section">
      {loadingBatches ? (
        <p style={{ color: "#aaa" }}>Loading batches…</p>
      ) : batches.length === 0 ? (
        <p style={{ color: "#aaa" }}>No batches found.</p>
      ) : (
        <>

          <div className="batch-list">
            {sortedBatches.map((batch) => {
              const annotated = batch.annotated_count || 0;
              const total = batch.file_count;
              const progress = total ? (annotated / total) * 100 : 0;

              return (
                <div
                  key={batch.id}
                  className="batch-card"
                  onClick={() => {navigate(`/projects/${projectId}/annotate/${batch.id}`);
}}

                >
                  <button
    className="batch-delete-btn"
    onClick={(e) => {
      e.stopPropagation();
      handleBatchDeleteClick(batch.id);
    }}
  >
    <Trash2 size={16} />
  </button>
                  <div className="batch-thumb">
                    <div className="thumb-box">
                      <img
                        src={
                          batch.thumbnail_url
                            ? `${API}${batch.thumbnail_url}`
                            : "https://via.placeholder.com/600x360"
                        }
                        alt={batch.name}
                        className="batch-thumbnail"
                      />
                    </div>
                  </div>

                  <div className="batch-content">
                    <div className="batch-header">
                      <strong>{batch.name}</strong>
                    </div>

                    <div className="batch-meta">
                      Created on{" "}
                      {new Date(batch.created_at).toLocaleDateString("en-GB")}
                    </div>

                    <div className="batch-counts">
                      <span>{total} images</span>
                      <div className="batch-status">
  <span className="annotated-dot">●</span>
  {batch.annotated_count} annotated
  <span className="unannotated-dot">○</span>
  {batch.unannotated_count} unannotated
</div>
                    </div>

                    <div className="batch-progress">
                      <div
                        className="batch-progress-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
    </div>
</div>
)}

      {/* ------------- BATCH DETAIL --------------*/}
{selectedBatch && !selectedImage && (
  <>
    <div className="batch-header-bar">
      <button
        className="back-link"
        onClick={() =>
  navigate(`/projects/${projectId}/annotate`)
}
      >
        ← 
      </button>
      <h1 className="batch-title">{selectedBatch?.name}</h1>
    </div>

    {/* Toolbar */}
    <div className="annotate-toolbar">
      <div className="annotate-toolbar-left">
        <div className="annotate-tabs">
          <button
  className={`ui-button ${filter === "unannotated" ? "active" : ""}`}
  onClick={() => setFilter("unannotated")}
>
  Unannotated {unannotatedCount}
</button>

<button
  className={`ui-button ${filter === "annotated" ? "active" : ""}`}
  onClick={() => setFilter("annotated")}
>
  Annotated {annotatedCount}
</button>
        </div>
      </div>

        <div className="annotate-toolbar-right">
          <SortDropdown
            value={imageSort}
            options={IMAGE_SORT_OPTIONS}
            onChange={setImageSort}
          />
        </div>
    </div>

    {/* Image Grid */}
    <div className="image-grid">
      {filteredImages.length === 0 ? (
        <div className="annotate-empty">
          <Image size={48} />
          <p>No images in this batch</p>
        </div>
      ) : (
        filteredImages.map((img) => (
          <div
    className="image-card"
    key={img.id}
  >
          <div className="thumb">
  <img
    src={
      img.thumbnail_url
        ? `${API}${img.thumbnail_url}`
        : ""
    }
    alt={img.filename}
  />

  <button
  className="delete-btn"
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteClick(img.id);
  }}
>
  <Trash2 size={16} />
</button>

  <div
    className="thumb-overlay"
    onClick={() => {
      navigate(
        `/projects/${projectId}/annotate/${batchId}/${img.id}`,
        {
          state: {
            filteredImages: filteredImages,
            filterType: filter,
          },
        }
      );
    }}
  >
    <span>Open</span>
  </div>
</div>
            <p className="filename">{img.filename}</p>
          </div>
        ))
      )}
    </div>
  </>
)}

{imageToDelete && (
  <div className="modal-overlay">
    <div className="modal-box">
      <p>Delete this image?</p>

      <div className="modal-actions">
        <button onClick={() => setImageToDelete(null)}>Cancel</button>
        <button onClick={confirmDelete}>Delete</button>
      </div>
    </div>
  </div>
)}

{batchToDelete && (
  <div className="modal-overlay">
    <div className="modal-box">
      <p>Delete this batch?</p>

      <div className="modal-actions">
        <button onClick={() => setBatchToDelete(null)}>Cancel</button>
        <button onClick={confirmBatchDelete}>Delete</button>
      </div>
    </div>
  </div>
)}

   </div> 
</ProjectSidebarLayout>

);}

export default AnnotatePage;
