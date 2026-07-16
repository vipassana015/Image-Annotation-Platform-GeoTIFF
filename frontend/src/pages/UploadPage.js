import React, { useState, useEffect } from "react";
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
  Paperclip,
} from "lucide-react";
import "../pages/Dashboard.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ProjectSidebarLayout from "../components/ProjectSidebarLayout";
import ClassDropdown from "./annotate/components/ClassDropdown";

function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [activeIcon, setActiveIcon] = useState("projects"); // Left collapsed sidebar
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState("idle");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [newBatchName, setNewBatchName] = useState("");
  const [showNewBatchInput, setShowNewBatchInput] = useState(false);
  
  const location = useLocation();
  const projectName = project?.name || "Project";

  const { projectId } = useParams();

  const API = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

useEffect(() => {
  const fetchProject = async () => {
    try {
      const res = await axios.get(
        `${API}/api/projects/${projectId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setProject(res.data);
    } catch (err) {
      console.error("Failed to fetch project info", err);
    } finally {
      setLoading(false);
    }
  };

  fetchProject();
}, [projectId]);


const fetchBatches = async () => {
    try {
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
      console.error("Failed to fetch batches", err);
    }
  };
useEffect(() => {
  fetchBatches();
}, [projectId]);


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
  if (files && files.length > 0) {
    uploadFiles(files, newBatchName); // Phase-1: single file
  }
};


if (loading) {
  return <div style={{ padding: "40px", color: "#aaa" }}>Loading project...</div>;
}

const uploadFiles = async (fileList, overrideBatchName = null) => {

  const fileNames = Array.from(fileList).map(f => f.name);
setUploadedFiles(fileNames);

  
  const formData = new FormData();

  // append ALL files
  for (let i = 0; i < fileList.length; i++) {
    formData.append("files", fileList[i]);
  }

const finalBatch = overrideBatchName || selectedBatch;

if (finalBatch && !isNaN(finalBatch)) {
  // Existing batch
  formData.append("batch_id", finalBatch);

} else if (finalBatch) {
  // New batch
  formData.append("new_batch_name", finalBatch);

} else {
  setUploadError("Please select or create a batch.");
  setUploading(false);
  setUploadStage("idle"); 
  return;
}
  setUploadStage("uploading");
  setTimeout(() => {
  setUploadStage("done");
}, 700); 

  try {
    const res = await axios.post(
  `${API}/api/projects/${projectId}/upload/`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percent);
    },
  }
);

    const data = res.data;

    setUploadStage("done");
setUploadedFiles(data.files);



    console.log("Upload success:", data);

    // handle new batch (same logic)
    if (data.batch_id) {
  setSelectedBatch(data.batch_id); 
  setNewBatchName("");
}

    await fetchBatches();


  } catch (err) {
    console.error("Upload failed:", err);

    if (err.response?.data?.detail) {
      setUploadError(err.response.data.detail);
    } else {
      setUploadError("Upload failed. Please try again.");
    }
     setUploadStage("idle");

  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};


  return (
  <ProjectSidebarLayout
    project={project}
    projectId={projectId}
  >
    

      {/* Main Upload Area */}
        {/* Left-aligned breadcrumb/header */}
        <div className="upload-header-left">
          <div className="breadcrumb-row">
            <span className="project-name-bc">{projectName}</span>
            <span className="bc-sep">›</span>
            <span className="current-tab">Upload </span>
          </div>
        </div>

        {/* Drag & Drop Section (only for upload tab) */}
        <div
  className={`upload-dropzone ${dragActive ? "active" : ""}`}
  onDragEnter={handleDrag}
  onDragLeave={handleDrag}
  onDragOver={handleDrag}
  onDrop={handleDrop}
>

          <>
  {/* ALWAYS VISIBLE */}
  <p>Drag and drop files to upload</p>

  <div className="batch-select-wrapper upload-dropdown-scope">
    <ClassDropdown
      value={selectedBatch}
      items={[
        ...batches,
        ...(newBatchName
          ? [{ id: newBatchName, name: newBatchName }]
          : [])
      ]}
      onChange={(id) => setSelectedBatch(id)}
      onCreate={(name) => {
        setNewBatchName(name);
        setSelectedBatch(name);
        return { id: name, name };
      }}
      label="Select batch"
      createLabel="+ Create New Batch"
      placeholder="Enter batch name..."
    />
  </div>

  <div className="upload-buttons">
    <input
      type="file"
      accept=".tif,.tiff"
      multiple
      style={{ display: "none" }}
      id="fileUploadInput"
      onChange={(e) => {
        if (e.target.files && e.target.files.length > 0) {
          uploadFiles(e.target.files);
        }
      }}
    />

    <button
      className="upload-btn"
      onClick={() =>
        document.getElementById("fileUploadInput").click()
      }
      disabled={uploading}
    >
      <Upload size={16} />
      Select Files
    </button>
  </div>

  {/* STATUS SECTION (CHANGES ONLY HERE) */}

  {uploadStage === "preparing" && (
    <div className="upload-status">
      <p>Preparing upload...</p>
    </div>
  )}

  {uploadStage === "uploading" && (
    <div className="upload-status">
      <p>Uploading files...</p>

      <div className="progress-bar">
  <div
    className="progress-fill"
    style={{ width: `${uploadProgress}%` }}
  ></div>
</div>

<p className="progress-text">{uploadProgress}%</p>

      <div className="file-list">
        {uploadedFiles.map((file, index) => (
          <div key={index} className="file-row">
            <span>{file}</span>
            <span>⏳</span>
          </div>
        ))}
      </div>
    </div>
  )}

  {uploadStage === "done" && (
    <div className="upload-success">
      <p className="success-text">Files uploaded successfully.</p>

      <div className="file-list">
        {uploadedFiles.map((file, index) => (
          <div key={index} className="file-row">
            <span>
             {(typeof file === "string" ? file : file.filename).split("/").pop()}
            </span>
            <span className="file-status"> <Paperclip size={14} /></span>
          </div>
        ))}
      </div>
      <div className="upload-actions">
  <button
    className="primary-btn"
    onClick={() =>
     navigate(`/projects/${projectId}/annotate/${selectedBatch}`)
    }
  >
    Start Annotating
  </button>
</div>
    </div>
    
  )}
</>
   



          </div>


{uploadError && (
  <p style={{ color: "red", marginTop: "10px" }}>
    {uploadError}
  </p>
)}


      </ProjectSidebarLayout>
  );
}

export default UploadPage;
