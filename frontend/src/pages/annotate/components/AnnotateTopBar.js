import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AnnotateTopBar({
imageName,
  currentIndex,
  total,
  onPrev,
  onNext,
   onAddToDataset,
   onGoToDataset
}) {
  return (
    <div className="annotate-topbar">
  
  {/* LEFT */}
  <div className="topbar-left">
    <span className="image-name">{imageName}</span>
  </div>

  {/* CENTER (ABSOLUTE — FIXED POSITION) */}
  <div className="topbar-center">
    <button
      className="nav-btn"
      onClick={onPrev}
      disabled={currentIndex === 0}
    >
      <ChevronLeft size={18} />
    </button>

    <span className="image-count">
      {currentIndex + 1} / {total}
    </span>

    <button
      className="nav-btn"
      onClick={onNext}
      disabled={currentIndex === total - 1}
    >
      <ChevronRight size={18} />
    </button>

     <button
  className="dataset-btn"
  onClick={onAddToDataset}
>
  Add to Dataset
</button>

<button
  className="dataset-btn"
  onClick={onGoToDataset}
>
  Go to Dataset
</button>
  </div>

  {/* RIGHT */}
  <div className="topbar-right">
    <span className="status">Saved</span>
  </div>

</div>
  );
}
