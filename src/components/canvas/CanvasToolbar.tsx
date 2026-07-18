import { StickyNote, Type, Square } from "lucide-react";
import type { CanvasNodeType } from "../../lib/store";

interface CanvasToolbarProps {
  onAddNode: (type: CanvasNodeType) => void;
}

const TOOLS: { type: CanvasNodeType; icon: typeof StickyNote; label: string }[] =
  [
    { type: "sticky", icon: StickyNote, label: "Sticky Note" },
    { type: "text", icon: Type, label: "Text" },
    { type: "shape", icon: Square, label: "Shape" },
  ];

export function CanvasToolbar({ onAddNode }: CanvasToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-lg p-1.5">
      {TOOLS.map((tool) => (
        <button
          key={tool.type}
          onClick={() => onAddNode(tool.type)}
          title={`Add ${tool.label}`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <tool.icon size={16} />
          {tool.label}
        </button>
      ))}
    </div>
  );
}
