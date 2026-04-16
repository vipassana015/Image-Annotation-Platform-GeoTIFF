import {
  Hand,
  Square,
  MousePointer2,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";
import { TOOLS } from "../constants/tools";

/*        LEFT TOOLBAR           */

export default function LeftToolbar({ 
activeTool, 
onToolChange, 
onDelete,
showAnnotations,
onToggleVisibility,
isLocked,
onToggleLock, }) {
  return (
    <div className="annotate-left-toolbar">

      <ToolbarButton
        title="Select"
        active={activeTool === TOOLS.SELECT}
        onClick={() => onToolChange(TOOLS.SELECT)}
      >
        <MousePointer2 size={18} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Pan"
        active={activeTool === TOOLS.PAN}
        onClick={() => onToolChange(TOOLS.PAN)}
      >
        <Hand size={18} />
      </ToolbarButton>

      <ToolbarButton
        title="Bounding Box"
        active={activeTool === TOOLS.BBOX}
        onClick={() => onToolChange(TOOLS.BBOX)}
      >
        <Square size={18} />
      </ToolbarButton>

      <ToolbarDivider />

<ToolbarButton
   className={`tool-button ${!showAnnotations ? "active" : ""}`}
  onClick={onToggleVisibility}
  title="Toggle Visibility"
>
  {showAnnotations ? <Eye size={18} /> : <EyeOff size={18} />}
</ToolbarButton>

<ToolbarButton
  className={`tool-button ${isLocked ? "active" : ""}`}
  onClick={onToggleLock}
  title="Toggle Lock Editing"
>
  {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
</ToolbarButton>

  <ToolbarDivider />
      <ToolbarButton
      title="Delete"
      onClick={onDelete}>
        <Trash2 size={18} />
      </ToolbarButton>

    </div>
  );
}


/*       INTERNAL COMPONENTS     */

function ToolbarButton({ children, title, active, onClick }) {
  return (
    <div
      className={`toolbar-btn ${active ? "active" : ""}`}
      title={title}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function ToolbarDivider() {
  return <div className="toolbar-divider" />;
}
