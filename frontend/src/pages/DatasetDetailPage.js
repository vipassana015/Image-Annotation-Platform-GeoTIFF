import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import ProjectSidebarLayout from "../components/ProjectSidebarLayout";
import { Image } from "lucide-react";
import SortDropdown from "../components/SortDropdown";
import ExportModal from "../components/ExportModal";

export default function DatasetDetailPage() {
  const location = useLocation();
  const { projectId, datasetId } = useParams();
  const datasetName = location.state?.datasetName || `Dataset ${datasetId}`;
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null); 

  const [project, setProject] = useState(null);
  const projectName = project?.name || "";
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportImages, setExportImages] = useState([]);

  const handleExportClick = () => {
  setExportImages(selectedImages);  // 🔥 SAVE SNAPSHOT
  setShowExportModal(true);
};

  const gridRef = useRef(null);
  const itemRefs = useRef({});
  const selectionRef = useRef(null);

   const IMAGE_SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Name (A–Z)", value: "name-asc" },
    { label: "Name (Z–A)", value: "name-desc" },
  ];
   const [imageSort, setImageSort] = useState(IMAGE_SORT_OPTIONS[0]);

   const filteredImages = images
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



/*------------------ Fetch Project --------------------- */
  useEffect(() => {
    const fetchProject = async () => {
      const res = await api.get(`/api/projects/${projectId}/`);
      setProject(res.data);
    };
    fetchProject();
  }, [projectId]);


/*-------------- Fetch Dataset Images ---------------- */
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.get(
          `/api/datasets/${datasetId}/images/`
        );
        setImages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchImages();
  }, [datasetId]);

/*---------------Delete Image----------------*/

const removeImage = async (imgId) => {
  try {
    await api.delete(
      `/api/datasets/${datasetId}/images/${imgId}/remove/`
    );
  } catch (err) {
    console.error("DELETE FAILED:", err.response?.data || err);
    throw err; // 🔥 IMPORTANT
  }
};

const bulkRemoveImages = async () => {
  const idsToRemove = [...selectedImages];

  const results = await Promise.allSettled(
    idsToRemove.map((imgId) => removeImage(imgId))
  );

  const successIds = idsToRemove.filter((_, index) => 
    results[index].status === "fulfilled"
  );

  const failed = results.filter(r => r.status === "rejected");

  if (failed.length > 0) {
    console.error("Some deletions failed:", failed);
  }

  // ✅ update only successful ones
  setImages(prev =>
    prev.filter(img => !successIds.includes(img.id))
  );

  setSelectedImages([]);
};

/*---------------Toggle Selection----------------*/

const toggleSelectImage = (imgId) => {
  setSelectedImages((prev) => {
    if (prev.includes(imgId)) {
      return prev.filter((id) => id !== imgId);
    } else {
      return [...prev, imgId];
    }
  });
};

/*---------------- Handlers -------------------*/

useEffect(() => {
  const handleDown = (e) => {
  if (e.button !== 0) return;

  if (e.target.closest(".image-card")) return;

  e.preventDefault();

  const box = {
    startX: e.clientX,
    startY: e.clientY,
    endX: e.clientX,
    endY: e.clientY,
  };

  selectionRef.current = box;   // 🔥 store in ref
  setSelectionBox(box);
  setIsDragging(true);
};


  const handleMove = (e) => {
  if (!isDragging) return;

  const updated = {
    ...selectionRef.current,
    endX: e.clientX,
    endY: e.clientY,
  };

  selectionRef.current = updated;  // 🔥 keep ref updated
  setSelectionBox(updated);
};

  const handleUp = () => {
  if (!isDragging) return;

  const finalBox = selectionRef.current; // 🔥 ALWAYS correct

  selectImagesInBox(finalBox);

  setIsDragging(false);
  setSelectionBox(null);
  selectionRef.current = null;
};

  // cursor + disable text selection
  if (isDragging) {
    document.body.classList.add("dragging");
  } else {
    document.body.classList.remove("dragging");
  }

  window.addEventListener("mousedown", handleDown);
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleUp);

  return () => {
    window.removeEventListener("mousedown", handleDown);
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleUp);
  };
}, [isDragging]);

/*-------------------Image Selection------------------*/

const selectImagesInBox = (box) => {
  if (!box) return;

  const x1 = Math.min(box.startX, box.endX);
  const y1 = Math.min(box.startY, box.endY);
  const x2 = Math.max(box.startX, box.endX);
  const y2 = Math.max(box.startY, box.endY);

  const selected = [];

  Object.entries(itemRefs.current).forEach(([id, el]) => {
    if (!el) return;

    const rect = el.getBoundingClientRect();

    const elX1 = rect.left;
    const elY1 = rect.top;
    const elX2 = rect.right;
    const elY2 = rect.bottom;

    const isIntersecting =
      x1 < elX2 &&
      x2 > elX1 &&
      y1 < elY2 &&
      y2 > elY1;

    if (isIntersecting) {
      selected.push(Number(id));
    }
  });

  setSelectedImages(selected);
};

  if (!project) return null;

  return (
    <ProjectSidebarLayout
      project={project}
      projectId={projectId}
      activeTab="datasets"
    >
      <div className="annotate-main">


        {/* Breadcrumb */}
        <div className="upload-header-left">
          <div className="breadcrumb-row">
            <span className="project-name-bc">{project.name}</span>
            <span className="bc-sep">›</span>
            <span className="current-tab">Dataset</span>
          </div>
        </div>

        {/* Content */}
        <div className="annotate-content">

          {/* Back */}
          <div className="batch-header-bar">
            
            <button
              className="back-link"
              onClick={() =>
                navigate(`/projects/${projectId}/datasets`)
              }
            >
              ←
            </button>
         <h1 className="batch-title">
  {datasetName}
</h1>
          </div>

           <div className="dataset-toolbar">

  {/* LEFT SIDE (selection lives here, not pushed to right) */}
  <div className="toolbar-left-group">


    {selectedImages.length > 0 && (
      <div className="selection-bar-inline">
        <span>{selectedImages.length} selected</span>
          <div className="selection-actions">

        <button
  className="toolbar-butn"
  onMouseDown={(e) => e.stopPropagation()}   
  onClick={(e) => {
    e.stopPropagation();        
    bulkRemoveImages();
  }}
>
  Remove
</button>
        
        <button className="toolbar-butn" onClick={() => setSelectedImages([])}>
            Clear
            </button>
            
       <button
  className="toolbar-butn"
  onMouseDown={(e) => e.stopPropagation()}
  onClick={(e) => {
    e.stopPropagation();
    handleExportClick();   
  }}
>
  Export
</button>
</div>
      </div>
    )}
  </div>

    {/* RIGHT SIDE (SORT ALWAYS EXTREME RIGHT) */}
    <div className="annotate-toolbar-right-group">

    <button
  className="export-dataset-btn"
  onClick={() => {
    setExportImages([]);   // full dataset
    setShowExportModal(true);
  }}
>
  Export Dataset
</button>

    <SortDropdown
      value={imageSort}
      options={IMAGE_SORT_OPTIONS}
      onChange={setImageSort}
    />
  </div>

</div>
  

          {/* Grid */}
          <div
  className={`image-grid ${isDragging ? "dragging" : ""}`}
  ref={gridRef}
>

            {images.length === 0 ? (
              <div className="annotate-empty">
                <Image size={48} />
                <p>No images in this dataset</p>
              </div>
            ) : (
  filteredImages.map((img) => {
    const isSelected = selectedImages.includes(img.id);
    console.log("selectedImages:", selectedImages);

    return (
      <div
        key={img.id}
        className={`image-card ${isSelected ? "selected" : ""}`}
        ref={(el) => (itemRefs.current[img.id] = el)}
       onClick={(e) => {
  if (isDragging) return;

  // 🔥 If selection mode is active → ONLY toggle
  if (selectedImages.length > 0) {
    toggleSelectImage(img.id);
    return;
  }

  // 🔥 Otherwise navigate
  if (!img.batch_id) {
    console.error("Batch ID missing for image:", img);
    return;
  }

  navigate(
    `/projects/${projectId}/annotate/${img.batch_id}/${img.id}`
  );
}}
      >
        <div className="thumb">
          <input
            type="checkbox"
            className="image-checkbox"
            checked={isSelected}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onChange={() => toggleSelectImage(img.id)}
          />

          <img
          draggable={false}
            src={
              img.file_url.startsWith("http")
                ? img.file_url
                : `http://127.0.0.1:8000${img.file_url}`
            }
            alt={img.filename}
          />

          <div className="thumb-overlay">
            <span>Open</span>
          </div>
        </div>

        <p className="filename">{img.filename}</p>

      </div>
    );
  })
)}
 
         </div>

        </div>
      </div>
      {selectionBox && (
  <div
    className="selection-rectangle"
    style={{
      position: "fixed",
      left: Math.min(selectionBox.startX, selectionBox.endX),
      top: Math.min(selectionBox.startY, selectionBox.endY),
      width: Math.abs(selectionBox.endX - selectionBox.startX),
      height: Math.abs(selectionBox.endY - selectionBox.startY),
      pointerEvents: "none",
      zIndex: 9999,
    }}
  />
)}

{showExportModal && (
  <ExportModal
    key={selectedImages.length}
    onClose={() => setShowExportModal(false)}
    datasetId={datasetId}
    selectedImages={exportImages}
    datasetName={datasetName}
    projectName={projectName}
    totalImages={images.length}
  />
)}

    </ProjectSidebarLayout>
  );
}