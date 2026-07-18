import { useState, useRef } from "react";
import { NodeResizer, type NodeProps, type Node } from "@xyflow/react";
import { X } from "lucide-react";

export type ShapeVariant = "rectangle" | "rounded" | "circle" | "diamond";

export interface ShapeNodeData extends Record<string, unknown> {
  text: string;
  shape: ShapeVariant;
  onTextChange: (text: string) => void;
  onShapeChange: (shape: ShapeVariant) => void;
  onDelete: () => void;
}

const SHAPES: { value: ShapeVariant; label: string }[] = [
  { value: "rectangle", label: "Rectangle" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Circle" },
  { value: "diamond", label: "Diamond" },
];

function shapeClass(shape: ShapeVariant) {
  switch (shape) {
    case "rectangle":
      return "rounded-none";
    case "rounded":
      return "rounded-2xl";
    case "circle":
      return "rounded-full";
    case "diamond":
      return "rounded-md";
  }
}

export function ShapeNode({ data, selected }: NodeProps<Node<ShapeNodeData>>) {
  const [text, setText] = useState(data.text);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setText(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => data.onTextChange(value), 400);
  };

  const isDiamond = data.shape === "diamond";

  return (
    <div className="relative w-full h-full">
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={60}
        lineClassName="!border-primary-500"
        handleClassName="!w-2.5 !h-2.5 !bg-primary-500 !border-0 !rounded-sm"
      />

      {selected && (
        <div className="nodrag absolute -top-9 left-0 flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm p-1 z-10">
          {SHAPES.map((s) => (
            <button
              key={s.value}
              onClick={() => data.onShapeChange(s.value)}
              title={s.label}
              className={`w-5 h-5 border-2 ${
                data.shape === s.value
                  ? "border-primary-500"
                  : "border-zinc-300 dark:border-zinc-600"
              } ${shapeClass(s.value)}`}
            />
          ))}
          <button
            onClick={data.onDelete}
            className="ml-1 p-0.5 rounded text-zinc-500 hover:text-red-500 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <div
        className={`w-full h-full border-2 border-primary-400 bg-primary-50/80 dark:bg-primary-900/20 flex items-center justify-center ${
          isDiamond ? "" : shapeClass(data.shape)
        }`}
        style={isDiamond ? { transform: "rotate(45deg)" } : undefined}
      >
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Label"
          style={isDiamond ? { transform: "rotate(-45deg)" } : undefined}
          className="nodrag w-[85%] h-[70%] resize-none bg-transparent border-none focus:outline-none text-center text-sm font-medium text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 leading-snug flex items-center justify-center"
        />
      </div>
    </div>
  );
}
