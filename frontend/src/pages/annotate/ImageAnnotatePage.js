import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation} from "react-router-dom";
import AnnotateTopBar from "./components/AnnotateTopBar";
import AnnotateWorkspace from "./components/AnnotateWorkspace";
import api from "../../api/axios";
import "./ImageAnnotatePage.css";
import { TOOLS } from "./constants/tools";
import ClassDropdown from "./components/ClassDropdown";




export default function ImageAnnotatePage() {

  const { projectId, batchId, imageId } = useParams();
  
  const [boxes, setBoxes] = useState([]);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [images, setImages] = useState( location.state?.filteredImages || []);
  const filterType = location.state?.filterType || null;
  const [imageUrl, setImageUrl] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [imageMetadata, setImageMetadata] = useState(null);


  useEffect(() => {
  const fetchDatasets = async () => {
    try {
      const res = await api.get(
        `/api/datasets/?project_id=${projectId}`
      );
      setDatasets(res.data);
    } catch (err) {
      console.error("Failed to fetch datasets:", err);
    }
  };

  fetchDatasets();
}, [projectId]);


  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const currentIndex = images.findIndex(
  (img) => String(img.id) === String(imageId));
  const currentImage = currentIndex >= 0 ? images[currentIndex] : null;

  const goNext = () => { if (currentIndex < images.length - 1) {
    const nextImage = images[currentIndex + 1];

   navigate(
  `/projects/${projectId}/annotate/${batchId}/${nextImage.id}`,
  { replace: true }
);
  }
};

const goPrev = () => {
  if (currentIndex > 0) {
    const prevImage = images[currentIndex - 1];

    navigate(
  `/projects/${projectId}/annotate/${batchId}/${prevImage.id}`,
  { replace: true }
);
  }
};



useEffect(() => {
  // ✅ If images already came from navigation → DO NOTHING
  if (images.length > 0) return;

  if (!batchId) return;

  const fetchImages = async () => {
    try {
      const res = await api.get(
        `/api/projects/${projectId}/batches/${batchId}/files/`
      );

      let data = res.data;

      // APPLY FILTER AFTER REFRESH
      if (filterType === "annotated") {
        data = data.filter(img => img.is_annotated);
      } else if (filterType === "unannotated") {
        data = data.filter(img => !img.is_annotated);
      }

      setImages(data);

    } catch (err) {
      console.error("Failed to fetch images:", err);
    }
  };

  fetchImages();
}, [batchId, projectId, filterType]);

useEffect(() => {
  const handleKey = (e) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  };

  window.addEventListener("keydown", handleKey);

  return () => {
    window.removeEventListener("keydown", handleKey);
  };
},  [currentIndex, images, goNext, goPrev]);

useEffect(() => {
  if (!imageId) return;

  const fetchImage = async () => {
    try {
      const response = await api.get(`/api/uploaded-files/${imageId}/`);

      setImageMetadata({
  width: response.data.width,
  height: response.data.height,
  crs: response.data.crs,
  bbox: response.data.bbox,
});

      console.log("RAW FILE FIELD:", response.data.file);

      const previewPath =
  response.data.thumbnail_url || response.data.file;

if (previewPath.startsWith("http")) {
  setImageUrl(previewPath);
} else {
  setImageUrl(`http://127.0.0.1:8000${previewPath}`);
}

    } catch (err) {
      console.error("IMAGE FETCH ERROR:", err);
    }
  };

  fetchImage();
}, [imageId]);
  /* ---------------- Fetch Classes ---------------- */

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get(
          `/api/class-labels/?project_id=${projectId}`
        );
        setClasses(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClasses();
  }, [projectId]);

  /* ---------------- Fetch Annotations ---------------- */

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const response = await api.get(
          `/api/annotations/?uploaded_file_id=${imageId}`
        );
        setBoxes(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnnotations();
  }, [imageId]);


useEffect(() => {
  console.log("FINAL IMAGE URL:", imageUrl);
}, [imageUrl]);

const createBox = async (newBox) => {
  try {
    const response = await api.post("/api/annotations/", {
      uploaded_file: imageId,
      class_label: null,
      x: newBox.x,
      y: newBox.y,
      width: newBox.width,
      height: newBox.height,
    });

    const createdBox = response.data;
setBoxes(prev => [...prev, createdBox]); 
    setSelectedBoxId(response.data.id);

     setUndoStack(prev => [
      ...prev,
      { type: "CREATE", box: createdBox }
    ]);
    setRedoStack([]);

  } catch (err) {
    console.error(err);
  }
};

const updateBox = async (id, updates) => {
    const oldBox = boxes.find(b => b.id === id);

  try {
    await api.patch(`/api/annotations/${id}/`, updates);

    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );

  } catch (err) {
    console.error(err);
  }
};


const deleteBox = async (id) => {
   const boxToDelete = boxes.find(b => b.id === id);
  try {
    await api.delete(`/api/annotations/${id}/`);
  } catch (err) {
    console.warn("Delete failed, removing locally");
  }

  setBoxes((prev) => prev.filter((b) => b.id !== id));
  setSelectedBoxId(null);

  setUndoStack(prev => [
    ...prev,
    { type: "DELETE", box: boxToDelete }
  ]);
  setRedoStack([]);
};

/*--------------Helpers---------------*/
const safeDelete = async (id) => {
  try {
    await api.delete(`/api/annotations/${id}`);
  } catch (err) {
    if (
      err.response?.status === 404 ||
      err.response?.status === 500
    ) {
      console.warn("Already deleted, safe to ignore");
    } else {
      console.error(err);
    }
  }
};

/*---------------Undo Action--------------*/

const undo = async () => {
  if (!undoStack.length) return;

  const lastAction = undoStack[undoStack.length - 1];
  if (!lastAction) return;

  console.log("UNDO:", lastAction);

  let updatedAction = lastAction;

  switch (lastAction.type) {

    // UNDO CREATE → DELETE
    case "CREATE": {
      await safeDelete(lastAction.box.id);

      setBoxes(prev =>
        prev.filter(b => String(b.id) !== String(lastAction.box.id))
      );
      break;
    }

    // UNDO DELETE → RE-CREATE
    case "DELETE": {
      const { id: _, created_at, ...cleanBox } = lastAction.box;

      try {
        const res = await api.post("/api/annotations/", cleanBox);

        setBoxes(prev => [...prev, res.data]);

        // update ID for future redo
        updatedAction = {
          ...lastAction,
          box: res.data
        };

      } catch (err) {
        console.error(err);
      }

      break;
    }

    // UNDO UPDATE → REVERT TO BEFORE
    case "UPDATE": {
      try {
        await api.patch(
          `/api/annotations/${lastAction.before.id}/`,
          lastAction.before
        );

        setBoxes(prev =>
          prev.map(b =>
            b.id === lastAction.before.id ? lastAction.before : b
          )
        );
      } catch (err) {
        console.error(err);
      }

      break;
    }
  }

  setUndoStack(prev => prev.slice(0, -1));
  setRedoStack(prev => [...prev, updatedAction]);
};

/*-------------------Redo Action-------------------*/

const redo = async () => {
  if (!redoStack.length) return;

  const action = redoStack[redoStack.length - 1];
  if (!action) return;

  console.log("REDO:", action);

  let updatedAction = action;

  switch (action.type) {

    case "CREATE": {
      const { id: _, created_at, ...cleanBox } = action.box;

      try {
        const res = await api.post("/api/annotations/", cleanBox);

        setBoxes(prev => [...prev, res.data]);

        updatedAction = {
          ...action,
          box: res.data
        };

      } catch (err) {
        console.error(err);
      }

      break;
    }

    case "DELETE": {
      await safeDelete(action.box.id);

      setBoxes(prev =>
        prev.filter(b => String(b.id) !== String(action.box.id))
      );

      break;
    }

    case "UPDATE": {
      try {
        await api.patch(
          `/api/annotations/${action.after.id}/`,
          action.after
        );

        setBoxes(prev =>
          prev.map(b =>
            b.id === action.after.id ? action.after : b
          )
        );
      } catch (err) {
        console.error(err);
      }

      break;
    }
  }

  setRedoStack(prev => prev.slice(0, -1));
  setUndoStack(prev => [...prev, updatedAction]);
};

/*-----------------Keyboard handlers--------------*/

useEffect(() => {
  const handleKeyDown = (e) => {
    const isDeleteKey =
      e.key === "Delete" || e.key === "Backspace";

    const tag = e.target.tagName;
    const isTyping =
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      e.target.isContentEditable;

    if (isDeleteKey && selectedBoxId && !isTyping) {
      e.preventDefault();
      deleteBox(selectedBoxId);
    }

if (e.ctrlKey && e.key === "z") {
  e.preventDefault();
  undo();
}

if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
  e.preventDefault();
  redo();
}
  };

  window.addEventListener("keydown", handleKeyDown);

  return () =>
    window.removeEventListener("keydown", handleKeyDown);
}, [selectedBoxId, undo,redo]);



useEffect(() => {
  if (currentIndex < images.length - 1) {
    const next = new Image();
    next.src = images[currentIndex + 1].thumbnail_url.startsWith("http")
  ? images[currentIndex + 1].thumbnail_url
  : `http://127.0.0.1:8000${images[currentIndex + 1].thumbnail_url}`;
  }
}, [currentIndex]);

useEffect(() => {
  console.log("IMAGES:", images);
  console.log("CURRENT INDEX:", currentIndex);
}, [images, currentIndex]);

useEffect(() => {
  if (images.length > 0 && currentIndex === -1) {
    const first = images[0];

    navigate(
      `/projects/${projectId}/annotate/${batchId}/${first.id}`,
      { replace: true }
    );
  }
}, [images, currentIndex]);

/* ---------------- Create Classes ---------------- */

const createClass = async (className) => {
  try {
    const response = await api.post("/api/class-labels/", {
      project: projectId,
      name: className,
      color: "#9ca3af", // default gray
    });

    setClasses((prev) => [...prev, response.data]);

    return response.data;
  } catch (err) {
    console.error(err);
  }
};



if (!imageUrl) {
  return (
    <div className="annotate-page">
      <AnnotateTopBar />
      <div style={{ color: "white", padding: "20px" }}>
        Loading image...
      </div>
    </div>
  );
}


/*------------------ Fetch Datasets --------------------*/



 console.log("DATASET:", selectedDataset);
console.log("IMAGE:", imageId);
  return (

  <div className="annotate-page">

    {/* TOP BAR */}
    <AnnotateTopBar
      imageName={currentImage?.filename}
      currentIndex={currentIndex}
      total={images.length}
      annotationCount={boxes.length}
      onPrev={goPrev}
      onNext={goNext}
      onAddToDataset={() => setIsDatasetModalOpen(true)}
      onGoToDataset={() => navigate(`/projects/${projectId}/datasets`)}
    />

    {/* BODY */}
    <div className="annotate-body">
      <AnnotateWorkspace
        imageUrl={imageUrl}
        imageId={imageId}
        imageMetadata={imageMetadata}
        boxes={boxes}
        setBoxes={setBoxes}
        selectedBoxId={selectedBoxId}
        setSelectedBoxId={setSelectedBoxId}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        classes={classes}
        createClass={createClass}
        createBox={createBox}
        updateBox={updateBox}
        deleteBox={deleteBox}
        undo={undo}
        redo={redo}
        undoStack={undoStack}
        redoStack={redoStack}
      />
    </div>

    {/* MODAL (ALWAYS INSIDE ROOT) */}
    {isDatasetModalOpen && (
      <div className="dataset-modal-overlay">
        <div className="dataset-modal">

          <div className="dataset-modal-header">
            Add to Dataset
            <button
  className="dataset-modal-close"
  onClick={() => setIsDatasetModalOpen(false)}
>
  ×
</button>
          </div>

          <div className="dataset-modal-body">

<ClassDropdown
  value={selectedDataset}
  items={datasets}
  onChange={setSelectedDataset}
  onCreate={async (name) => {
  try {
    const res = await api.post("/api/datasets/create/", {
      name,
      project: projectId
    });

    setDatasets(prev => [...prev, res.data]);
    return res.data;

  } catch (err) {
    console.error("Dataset creation failed:", err);
  }
}}
  createLabel="+ Create Dataset"
  placeholder="Enter dataset name"
  label="Select Dataset"
/>

          </div>

          <div className="dataset-modal-footer">
            <button onClick={() => setIsDatasetModalOpen(false)}>
              Cancel
            </button>

            <button
  onClick={async () => {
    if (!selectedDataset) {
      setToast({
  type: "warning",
  message: "Please select a dataset"
});
      return;
    }

    try {
  await api.post("/api/dataset-images/", {
    dataset: selectedDataset?.id || selectedDataset,
    uploaded_file: imageId
  });

 setToast({
  type: "success",
  message: "Image added to dataset"
});
  setIsDatasetModalOpen(false);

} catch (err) {
  if (err.response?.status === 400) {
    setToast({
  type: "error",
  message: "Image already exists in dataset"
});
  } else {
    console.error(err);
    setToast({
  type: "error",
  message: "Error adding image"
});
  }
}
  }}
>
  Add
</button>
          </div>

        </div>
      </div>
    )}

{toast && (
  <div className="custom-alert-overlay">
    <div className={`custom-alert ${toast.type}`}>

      <div className="custom-alert-message">
        {toast.message}
      </div>

     <div className="custom-alert-footer">

  {(toast.type === "success" ||
    toast.message.includes("already exists")) && (
    <button
  className="custom-alert-action"
  onClick={() => {
    const datasetObj = datasets.find(
      d =>
        String(d.id) ===
        String(selectedDataset?.id || selectedDataset)
    );

    if (!datasetObj) return;

    navigate(
      `/projects/${projectId}/datasets/${datasetObj.id}`,
      {
        state: {
          datasetName: datasetObj.name
        }
      }
    );
  }}
>
  Go to Dataset
</button>
  )}

  <button
    className="custom-alert-close"
    onClick={() => setToast(null)}
  >
    Close
  </button>

</div>

    </div>
  </div>
)}

  </div>
);
}