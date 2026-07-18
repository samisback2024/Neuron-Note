import { useState, useRef } from "react";
import { NodeResizer, type NodeProps, type Node } from "@xyflow/react";
import { X } from "lucide-react";

export interface TextNodeData extends Record<string, unknown> {
  text: string;
  onTextChange: (text: string) => void;
  onDelete: () => void;
}

export function TextNode({ data, selected }: NodeProps<Node<TextNodeData>>) {
  const [text, setText] = useState(data.text);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setText(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => data.onTextChange(value), 400);
  };

  return (
    <div className="relative w-full h-full group">
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={32}
        lineClassName="!border-primary-500"
        handleClassName="!w-2.5 !h-2.5 !bg-primary-500 !border-0 !rounded-sm"
      />
      {selected && (
        <button
          onClick={data.onDelete}
          className="nodrag absolute -top-3 -right-3 p-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500 shadow-sm transition-colors z-10"
        >
          <X size={11} />
        </button>
      )}
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Text..."
        className="nodrag w-full h-full resize-none bg-transparent border-none focus:outline-none text-lg font-medium text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 leading-snug"
      />
    </div>
  );
}
