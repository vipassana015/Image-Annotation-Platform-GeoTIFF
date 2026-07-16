import { ZoomIn, ZoomOut, Maximize, RotateCcw, Undo2, Redo2  } from "lucide-react";

export default function BottomBar({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
  minZoom,
  maxZoom,
  undo,
  redo,
  undoStack,
  redoStack,
}) {
  return (
    <div className="annotate-bottom-bar">
      <div className="bottom-bar-inner">

        <button
          className="bottom-bar-btn"
          onClick={onZoomOut}
          disabled={scale <= minZoom}
        >
          <ZoomOut size={16} />
        </button>

        <span className="zoom-display">
          {Math.round(scale * 100)}%
        </span>

        <button
          className="bottom-bar-btn"
          onClick={onZoomIn}
          disabled={scale >= maxZoom}
        >
          <ZoomIn size={16} />
        </button>

        <div className="bottom-divider" />

        <button
          className="bottom-bar-btn"
          onClick={onFit}
        >
          <Maximize size={16} />
        </button>

        <button
          className="bottom-bar-btn"
          onClick={onReset}
        >
          <RotateCcw size={16} />
        </button>

       <button
  className="bottom-bar-btn"
  onClick={undo}
  disabled={!undoStack.length}
>
  <Undo2 size={16} />
</button>

<button
  className="bottom-bar-btn"
  onClick={redo}
  disabled={!redoStack.length}
>
  <Redo2 size={16} />
</button>

      </div>
    </div>
  );
}