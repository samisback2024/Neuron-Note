import { useState, useRef } from "react";
import { NodeResizer, type NodeProps, type Node } from "@xyflow/react";
import { X } from "lucide-react";
import {
  STICKY_COLORS,
  STICKY_COLOR_STYLES,
  type StickyColor,
} from "./stickyColors";

export interface StickyNoteNodeData extends Record<string, unknown> {
  text: string;
  color: StickyColor;
  onTextChange: (text: string) => void;
  onColorChange: (color: StickyColor) => void;
  onDelete: () => void;
}

export function StickyNoteNode({
  data,
  selected,
}: NodeProps<Node<StickyNoteNodeData>>) {
  const [text, setText] = useState(data.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setText(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => data.onTextChange(value), 400);
  };

  const style = STICKY_COLOR_STYLES[data.color];

  return (
    <div
      className={`w-full h-full rounded-2xl border-2 shadow-sm p-3 flex flex-col ${style.bg} ${style.border}`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={140}
        minHeight={120}
        lineClassName="!border-primary-500"
        handleClassName="!w-2.5 !h-2.5 !bg-primary-500 !border-0 !rounded-sm"
      />

      {selected && (
        <div className="nodrag flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            {STICKY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => data.onColorChange(c)}
                aria-label={c}
                className={`w-4 h-4 rounded-full ${STICKY_COLOR_STYLES[c].swatch} ${
                  data.color === c
                    ? "ring-2 ring-offset-1 ring-zinc-500"
                    : "hover:scale-110"
                } transition-transform`}
              />
            ))}
          </div>
          <button
            onClick={data.onDelete}
            className="p-0.5 rounded-full text-zinc-500 hover:bg-black/10 dark:hover:bg-white/10 hover:text-red-500 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type a note..."
        className="nodrag flex-1 w-full resize-none bg-transparent border-none focus:outline-none text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-500/60 leading-snug"
      />
    </div>
  );
}
