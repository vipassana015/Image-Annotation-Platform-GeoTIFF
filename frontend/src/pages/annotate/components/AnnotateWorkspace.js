import {
  Stage,
  Layer,
  Group,
  Image as KonvaImage,
  Rect,
  Transformer,
  Text,
} from "react-konva";
import { useEffect, useRef, useState, useCallback } from "react";
import * as GeoTIFF from "geotiff"; 

import LeftToolbar from "./LeftToolbar";
import BottomBar from "./BottomBar";
import AnnotationEditor from "./AnnotationEditor";
import { TOOLS } from "../constants/tools";
import RightSidebar from "./RightSidebar";

export default function AnnotateWorkspace({
  imageUrl,
  imageId,
  boxes = [],
  setBoxes = () => {},
  selectedBoxId = null,
  setSelectedBoxId = () => {},
  activeTool,
  setActiveTool = () => {},
  classes = [],
  createClass = () => {},
  createBox = () => {},
  updateBox = () => {},
  deleteBox = () => {},
  undo,
  redo,
  undoStack,
  redoStack,
}) {

  
const containerRef = useRef(null);
  const stageRef = useRef(null);
   const groupRef = useRef(null);
  
  const transformerRef = useRef(null);
  const selectedShapeRef = useRef(null);

  const [isStageReady, setIsStageReady] = useState(false);

 const [stageSize, setStageSize] = useState({
  width: 0,
  height: 0,
});
  const [imageObj, setImageObj] = useState(null);
  const [scale, setScale] = useState(1);


  const [drawingBox, setDrawingBox] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hoveredBoxId, setHoveredBoxId] = useState(null);
  const [selectedBoxPosition, setSelectedBoxPosition] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });

const fitToScreen = useCallback(() => {
  if (!imageObj) return;
  if (!stageSize.width || !stageSize.height) return;

  const stageWidth = stageSize.width;
  const stageHeight = stageSize.height;

  const imgWidth = imageObj.width;
  const imgHeight = imageObj.height;

  const SIDE_PADDING = 20;
  const TOP_PADDING = 20;
  const BOTTOM_PADDING = 60;

  const usableWidth = stageWidth - SIDE_PADDING * 2;
  const usableHeight = stageHeight - TOP_PADDING - BOTTOM_PADDING;

  const scaleX = usableWidth / imgWidth;
  const scaleY = usableHeight / imgHeight;

  const finalScale = Math.min(scaleX, scaleY);

  const scaledWidth = imgWidth * finalScale;
  const scaledHeight = imgHeight * finalScale;

  const finalX =
    SIDE_PADDING + (usableWidth - scaledWidth) / 2;

  const finalY =
    TOP_PADDING + (usableHeight - scaledHeight) / 2;

  setScale(finalScale);
  setPosition({ x: finalX, y: finalY });

}, [imageObj, stageSize]);


const clampPosition = (newPos, currentScale = scale) => {
  if (!imageObj || !stageSize.width || !stageSize.height) return newPos;

  const stageWidth = stageSize.width;
  const stageHeight = stageSize.height;

  const imgWidth = imageObj.width * currentScale;
  const imgHeight = imageObj.height * currentScale;

  const MARGIN = 120; // tweak this (80–150 ideal)

  let minX, maxX, minY, maxY;

  if (imgWidth < stageWidth) {
    // allow movement but within margin
    const centerX = (stageWidth - imgWidth) / 2;
    minX = centerX - MARGIN;
    maxX = centerX + MARGIN;
  } else {
    minX = stageWidth - imgWidth - MARGIN;
    maxX = MARGIN;
  }

  if (imgHeight < stageHeight) {
    const centerY = (stageHeight - imgHeight) / 2;
    minY = centerY - MARGIN;
    maxY = centerY + MARGIN;
  } else {
    minY = stageHeight - imgHeight - MARGIN;
    maxY = MARGIN;
  }

  return {
    x: Math.max(minX, Math.min(newPos.x, maxX)),
    y: Math.max(minY, Math.min(newPos.y, maxY)),
  };
};



/*---------Shortcuts-------------*/


useEffect(() => {
  console.log({ stage: stageRef.current?.position(), position, scale });
}, [scale, position]);

useEffect(() => {
  if (containerRef.current) {
    console.log("CONTAINER SIZE:",
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
  }
}, [stageSize]);

useEffect(() => {
  const handleKeyDown = (e) => {
    // avoid triggering inside inputs
    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    // ===== DELETE =====
    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedBoxId) {
        deleteBox(selectedBoxId);
      }
    }

    // ===== ESC (deselect) =====
    if (e.key === "Escape") {
      setSelectedBoxId(null);
    }

    // ===== NUMBER KEYS (assign class) =====
    if (!isNaN(e.key)) {
      const index = parseInt(e.key) - 1;

      if (classes[index] && selectedBoxId) {
        updateBox(selectedBoxId, {
          class_label: classes[index].id,
        });
      }
    }

    // ===== LOCK =====
    if (e.key.toLowerCase() === "l") {
      setIsLocked((prev) => !prev);
    }

    // ===== VISIBILITY =====
    if (e.key.toLowerCase() === "v") {
      setShowAnnotations((prev) => !prev);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedBoxId, classes, isLocked]);


 /* ---------------- Resize  ---------------- */

useEffect(() => {
  if (!containerRef.current) return;

  const updateSize = () => {
    const rect = containerRef.current.getBoundingClientRect();

    console.log("CONTAINER SIZE:", rect.width, rect.height);

    if (rect.width > 0 && rect.height > 0) {
  setStageSize({
    width: rect.width,
    height: rect.height,
  });

  setIsStageReady(true); // 👈 ADD THIS
}
  };

  updateSize();

  const observer = new ResizeObserver(updateSize);
  observer.observe(containerRef.current);

  return () => observer.disconnect();
}, []);

  /* ---------------- Image Loading ---------------- */
useEffect(() => {
  if (isLocked) {
    setSelectedBoxId(null);
  }
}, [isLocked, setSelectedBoxId]);

useEffect(() => {
  if (!imageUrl) {
    console.log("❌ imageUrl not ready");
    setImageObj(null); // reset
    return;
  }

  console.log("🔥 LOADING IMAGE:", imageUrl);

  const loadImage = async () => {
    try {
      if (imageUrl.endsWith(".tif") || imageUrl.endsWith(".tiff")) {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();

        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();

        const [r, g, b] = await image.readRGB();

        const width = image.getWidth();
        const height = image.getHeight();

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        const imageData = ctx.createImageData(width, height);

        for (let i = 0; i < r.length; i++) {
          imageData.data[i * 4 + 0] = r[i];
          imageData.data[i * 4 + 1] = g[i];
          imageData.data[i * 4 + 2] = b[i];
          imageData.data[i * 4 + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        const img = new window.Image();
        img.src = canvas.toDataURL();

        img.onload = () => {
          console.log("✅ TIFF IMAGE READY");
          setImageObj(img);
        };
      } else {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;

        img.onload = () => {
          console.log("✅ NORMAL IMAGE READY");
          setImageObj(img);
        };
      }
    } catch (err) {
      console.error("TIFF LOAD ERROR:", err);
    }
  };

  loadImage();
}, [imageUrl]); // 🔥 THIS IS CRITICAL

// 🔥 ADD THIS HERE (just below image loading useEffect)

useEffect(() => {
  if (imageObj && stageSize.width && stageSize.height) {
    fitToScreen();
  }
}, [imageObj, stageSize]);

  /* ---------------- Zoom ---------------- */
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const ZOOM_STEP = 1.1;

const handleWheel = (e) => {
  e.evt.preventDefault();

  const stage = stageRef.current;
  const pointer = stage.getPointerPosition();
  if (!pointer) return;

  const oldScale = scale;
  if (oldScale <= 0) return;

  const scaleBy = ZOOM_STEP;

  const newScale =
    e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

  const clampedScale = Math.max(MIN_ZOOM, Math.min(newScale, MAX_ZOOM));

  const mousePointTo = {
    x: (pointer.x - position.x) / oldScale,
    y: (pointer.y - position.y) / oldScale,
  };

  const newPos = {
    x: pointer.x - mousePointTo.x * clampedScale,
    y: pointer.y - mousePointTo.y * clampedScale,
  };

  setScale(clampedScale);
  setPosition(clampPosition(newPos));
};

const zoomAroundPoint = (point, newScaleInput) => {
  const oldScale = scale;
  if (oldScale <= 0) return;

  const newScale = Math.max(MIN_ZOOM, Math.min(newScaleInput, MAX_ZOOM));

  const mousePointTo = {
    x: (point.x - position.x) / oldScale,
    y: (point.y - position.y) / oldScale,
  };

  const newPos = {
    x: point.x - mousePointTo.x * newScale,
    y: point.y - mousePointTo.y * newScale,
  };

  setScale(newScale);
  setPosition(clampPosition(newPos));
};


const handleZoomIn = () => {
  const stage = stageRef.current;
  if (!stage) return;

  const center = {
    x: stage.width() / 2,
    y: stage.height() / 2,
  };

  const newScale = Math.min(scale * ZOOM_STEP, MAX_ZOOM);
  zoomAroundPoint(center, newScale);
};

const handleZoomOut = () => {
  const stage = stageRef.current;
  if (!stage) return;

  const center = {
    x: stage.width() / 2,
    y: stage.height() / 2,
  };

  const newScale = Math.max(scale / ZOOM_STEP, MIN_ZOOM);
  zoomAroundPoint(center, newScale);

};


 /* ----------------Fit---------------- */

const resetTransform = () => {
  fitToScreen();
};

  /* ---------------- Pointer Helpers ---------------- */

  const getPointerPosition = () => {
  const stage = stageRef.current;
  const group = groupRef.current;

  if (!stage || !group) return null;

  const pointer = stage.getPointerPosition();
  if (!pointer) return null;

  const transform = group.getAbsoluteTransform().copy();
  transform.invert();

  return transform.point(pointer);
};

  /* ---------------- Drawing Logic ---------------- */

  const handleMouseDown = (e) => {
   if (isLocked) return; 
   if (activeTool === TOOLS.PAN) return;

if (activeTool !== TOOLS.BBOX) {
  if (e.target === e.target.getStage()) {
    setSelectedBoxId(null);
  }
  return;
}

    const pos = getPointerPosition();
    if (!pos) return;

if (!imageObj) return;

if (
  pos.x < 0 ||
  pos.y < 0 ||
  pos.x > imageObj.width ||
  pos.y > imageObj.height
) {
  return;
}

 setDrawingBox({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };



  const handleMouseMove = (e) => {
    if (isLocked) return;
    if (activeTool === TOOLS.PAN) return;

    if (!drawingBox) return;

    const pos = getPointerPosition();
    if (!pos) return;

    const maxX = imageObj.width;
const maxY = imageObj.height;

const clampedX = Math.max(0, Math.min(pos.x, maxX));
const clampedY = Math.max(0, Math.min(pos.y, maxY));

setDrawingBox({
  ...drawingBox,
  width: clampedX - drawingBox.x,
  height: clampedY - drawingBox.y,
});
  };

  const handleMouseUp = () => {
    if (isLocked) return;
    if (activeTool === TOOLS.PAN) return;
    if (!drawingBox) return;

    let { x, y, width, height } = drawingBox;

    if (Math.abs(width) < 5 || Math.abs(height) < 5) {
      setDrawingBox(null);
      return;
    }

    if (width < 0) {
      x += width;
      width = Math.abs(width);
    }

    if (height < 0) {
      y += height;
      height = Math.abs(height);
    }

    const newId = Date.now();

    // AFTER fixing negative width/height

// 🔥 ADD THIS BLOCK
const maxX = imageObj.width;
const maxY = imageObj.height;

// clamp position
x = Math.max(0, Math.min(x, maxX));
y = Math.max(0, Math.min(y, maxY));

// clamp size
if (x + width > maxX) {
  width = maxX - x;
}

if (y + height > maxY) {
  height = maxY - y;
}

createBox({
  id: newId,
  x,
  y,
  width,
  height,
  class_label: null,
});

setSelectedBoxId(newId);  

const stage = stageRef.current;
const containerRect = stage.container().getBoundingClientRect();

const screenX =
  x * scale + position.x + containerRect.left;

const screenY =
  y * scale + position.y + containerRect.top;

setSelectedBoxPosition({
  screenX,
  screenY,
  width: width * scale,
  height: height * scale,
});

setDrawingBox(null);
  };

  /* ---------------- Transformer ---------------- */

  useEffect(() => {
    if (selectedShapeRef.current && transformerRef.current) {
      transformerRef.current.nodes([selectedShapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedBoxId]);



 const selectedBox = (boxes || []).find((b) => b.id === selectedBoxId);

  let popupPosition = null;

if (selectedBox && selectedBoxPosition) {
  const popupWidth = 260;
  const popupHeight = 140;
  const GAP = 12;

  let x =
    selectedBoxPosition.screenX +
    selectedBoxPosition.width / 2 -
    popupWidth / 2;

  let y =
    selectedBoxPosition.screenY -
    popupHeight -
    GAP;

  // 🔥 if not enough space above → place below
  if (y < 10) {
    y =
      selectedBoxPosition.screenY +
      selectedBoxPosition.height +
      GAP;
  }

  popupPosition = {
    screenX: x,
    screenY: y,
  };
}

   if (!imageUrl) {
  return <div style={{ color: "white" }}>Loading image...</div>;
}
  /* ---------------- Render ---------------- */


return (

  <div className="annotate-workspace">

    {/* LEFT TOOLBAR */}
    <div className="annotate-left">
      <LeftToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onDelete={() => selectedBoxId && deleteBox(selectedBoxId)}
        showAnnotations={showAnnotations}
        onToggleVisibility={() => setShowAnnotations((prev) => !prev)}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked((prev) => !prev)} 
      />
    </div>

    {/* CENTER CANVAS */}
    <div className="annotate-center">
     
      <div ref={containerRef} className="annotate-canvas-container">
         {isStageReady && (
        <Stage
          ref={stageRef}
  width={stageSize.width}
  height={stageSize.height}

          onWheel={handleWheel}
         onMouseDown={activeTool === TOOLS.PAN ? undefined : handleMouseDown}
  onMouseMove={activeTool === TOOLS.PAN ? undefined : handleMouseMove}
  onMouseUp={activeTool === TOOLS.PAN ? undefined : handleMouseUp}
          style={{
            cursor:
  activeTool === TOOLS.PAN
    ? "grab"
    : activeTool === TOOLS.BBOX
    ? "crosshair"
    : "default",
          }}
        >
          <Layer>

            <Group
            ref={groupRef}

  x={position.x}
  y={position.y}
  scaleX={scale}
  scaleY={scale}

               draggable={!isLocked && activeTool === TOOLS.PAN}
onDragMove={(e) => {
  const rawPos = e.target.position();
  const clamped = clampPosition(rawPos);

  e.target.x(clamped.x);
  e.target.y(clamped.y);
}}

onDragEnd={(e) => {
  const rawPos = e.target.position();
  const clamped = clampPosition(rawPos);

  setPosition(clamped); // ✅ ONLY HERE
}}
            >
              {/* IMAGE */}
              {imageObj && (
                <KonvaImage
  image={imageObj}
  x={0}
  y={0}
  
/>
              )}

              {/* DRAWING BOX */}
              {drawingBox && (
                <Rect
               
                  x={drawingBox.x}
                  y={drawingBox.y}
                 width={drawingBox.width}
  height={drawingBox.height}
                  stroke="#60a5fa"
                  dash={[4, 4]}
                  strokeWidth={0.5}
                />
              )}

              {/* ANNOTATIONS */}
              {showAnnotations &&
                (boxes || []).map((box) => {
                  const boxClass = (classes || []).find(
                    (c) => c.id === box.class_label
                  );

                  return (
                 <Group key={box.id}>
                      {/* BOX */}
                      <Rect
                        ref={
                          box.id === selectedBoxId
                            ? selectedShapeRef
                            : null
                        }
                        x={box.x}
                        y={box.y}
                        width={box.width}
                        height={box.height}
                        dragBoundFunc={(pos) => {
  const maxX = imageObj.width - box.width;
  const maxY = imageObj.height - box.height;

  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY)),
  };
}}
                        stroke={
                          box.id === selectedBoxId
                            ? "#ffffff"
                            : box.id === hoveredBoxId
                            ? "#facc15"
                            : boxClass?.color || "#8d0c0cff"
                        }
                        strokeWidth={
                          box.id === selectedBoxId
                            ? 2
                            : box.id === hoveredBoxId
                            ? 2
                            : 1.5
                        }
                        draggable={
                          box.id === selectedBoxId && !isLocked
                        }
                        onDragStart={(e) => {
                          if (isLocked) e.target.stopDrag();
                        }}
                        listening={!isLocked}
                        onClick={(e) => {
                          e.cancelBubble = true;
  const node = e.target;

  const rect = node.getClientRect(); // 🔥 real position

  const stage = node.getStage();
  const containerRect = stage.container().getBoundingClientRect();

  const screenX = rect.x + containerRect.left;
  const screenY = rect.y + containerRect.top;

  setSelectedBoxId(box.id);

  setSelectedBoxPosition({
    screenX,
    screenY,
    width: rect.width,
    height: rect.height,
  });
}}
                        onDragEnd={(e) => {
  if (isLocked) return;

  let { x, y } = e.target.position();

  const boxWidth = box.width;
  const boxHeight = box.height;

  const maxX = imageObj.width - boxWidth;
  const maxY = imageObj.height - boxHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  updateBox(box.id, { x, y });
}}
                       onTransformEnd={(e) => {
  if (isLocked) return;

  const node = e.target;

  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  node.scaleX(1);
  node.scaleY(1);

  let newWidth = Math.max(5, node.width() * scaleX);
  let newHeight = Math.max(5, node.height() * scaleY);

  let newX = node.x();
  let newY = node.y();

  // 🔥 Clamp inside image
  if (newX < 0) newX = 0;
  if (newY < 0) newY = 0;

  if (newX + newWidth > imageObj.width) {
    newWidth = imageObj.width - newX;
  }

  if (newY + newHeight > imageObj.height) {
    newHeight = imageObj.height - newY;
  }

  updateBox(box.id, {
  x: newX,
  y: newY,
  width: newWidth,
  height: newHeight,
});
}}
                      />

                      {/* LABEL */}
                      <Text
                        x={box.x - 2}
                        y={box.y - 6}
                        text={boxClass?.name || "Unassigned"}
                        fontSize={3}
                        fill="#b1c722ff"
                        padding={2}
                        background={
                          boxClass?.color || "#6b7280"
                        }
                      />
                   </Group>
                  );
                })}
            </Group>


            

            {/* TRANSFORMER */}
            {selectedBoxId && !isLocked && (
              <Transformer
                ref={transformerRef}
                rotateEnabled={false}
                anchorSize={6}
                borderStroke="#3b82f6"
              />
            )}
          </Layer>
        </Stage>
        )}
      </div>
          

      {/* BOTTOM BAR */}
      <BottomBar
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
         undo={undo}
  redo={redo}
  undoStack={undoStack}
  redoStack={redoStack}
        onFit={fitToScreen}
        onReset={fitToScreen}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      />
    </div>

    {/* RIGHT SIDEBAR */}

{isSidebarOpen && (
  <div className="annotate-right">

    <button
      className="sidebar-chevron"
      onClick={() => setIsSidebarOpen(false)}
    >
      ‹
    </button>

    <div className="annotate-sidebar">
      <RightSidebar
        classes={classes}
        boxes={boxes}
        selectedBoxId={selectedBoxId}
        setHoveredBoxId={setHoveredBoxId}
      />
    </div>
  </div>
)}

{!isSidebarOpen && (
  <button
    className="sidebar-chevron-open"
    onClick={() => setIsSidebarOpen(true)}
  >
    ›
  </button>
)}

    {/* POPUP */}
    {selectedBox && popupPosition && (
      <AnnotationEditor
        box={{
          ...selectedBox,
          screenX: popupPosition.screenX,
          screenY: popupPosition.screenY,
        }}
        classes={classes}
        onCreateClass={createClass}
        updateBoxClass={(id, class_label) =>
          updateBox(id, { class_label })
        }
        onDelete={deleteBox}
        onClose={() => setSelectedBoxId(null)}
      />
    )}
  </div>
);
}



 