import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  useReactFlow,
  applyNodeChanges,
  type Node,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Shapes } from "lucide-react";
import { useStore, type CanvasNode, type CanvasNodeType } from "../lib/store";
import { StickyNoteNode, type StickyNoteNodeData } from "../components/canvas/StickyNoteNode";
import { TextNode, type TextNodeData } from "../components/canvas/TextNode";
import { ShapeNode, type ShapeNodeData } from "../components/canvas/ShapeNode";
import { CanvasToolbar } from "../components/canvas/CanvasToolbar";
import { EmptyState } from "../components/ui/EmptyState";
import type { StickyColor } from "../components/canvas/stickyColors";
import type { ShapeVariant } from "../components/canvas/ShapeNode";

const nodeTypes: NodeTypes = {
  sticky: StickyNoteNode,
  text: TextNode,
  shape: ShapeNode,
};

const DEFAULT_SIZE: Record<CanvasNodeType, { width: number; height: number }> = {
  sticky: { width: 220, height: 180 },
  text: { width: 160, height: 44 },
  shape: { width: 160, height: 100 },
};

function toFlowNode(
  n: CanvasNode,
  callbacks: {
    onTextChange: (id: string, text: string) => void;
    onColorChange: (id: string, color: StickyColor) => void;
    onShapeChange: (id: string, shape: ShapeVariant) => void;
    onDelete: (id: string) => void;
  },
): Node {
  const size = DEFAULT_SIZE[n.type];
  const base = {
    id: n.id,
    position: { x: n.position_x, y: n.position_y },
    width: n.width ?? size.width,
    height: n.height ?? size.height,
    selected: false,
  };

  if (n.type === "sticky") {
    const data: StickyNoteNodeData = {
      text: n.data.text ?? "",
      color: (n.data.color as StickyColor) ?? "yellow",
      onTextChange: (text) => callbacks.onTextChange(n.id, text),
      onColorChange: (color) => callbacks.onColorChange(n.id, color),
      onDelete: () => callbacks.onDelete(n.id),
    };
    return { ...base, type: "sticky", data };
  }

  if (n.type === "shape") {
    const data: ShapeNodeData = {
      text: n.data.text ?? "",
      shape: n.data.shape ?? "rounded",
      onTextChange: (text) => callbacks.onTextChange(n.id, text),
      onShapeChange: (shape) => callbacks.onShapeChange(n.id, shape),
      onDelete: () => callbacks.onDelete(n.id),
    };
    return { ...base, type: "shape", data };
  }

  const data: TextNodeData = {
    text: n.data.text ?? "",
    onTextChange: (text) => callbacks.onTextChange(n.id, text),
    onDelete: () => callbacks.onDelete(n.id),
  };
  return { ...base, type: "text", data };
}

function CanvasInner() {
  const {
    canvasNodes,
    canvasNodesLoaded,
    createCanvasNode,
    updateCanvasNode,
    deleteCanvasNode,
  } = useStore();
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const handleTextChange = useCallback(
    (id: string, text: string) => {
      updateCanvasNode(id, { data: { ...findData(id), text } });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const handleColorChange = useCallback((id: string, color: StickyColor) => {
    updateCanvasNode(id, { data: { ...findData(id), color } });
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, color } } : n,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleShapeChange = useCallback((id: string, shape: ShapeVariant) => {
    updateCanvasNode(id, { data: { ...findData(id), shape } });
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, shape } } : n,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleDelete = useCallback((id: string) => {
    deleteCanvasNode(id);
    setNodes((nds) => nds.filter((n) => n.id !== id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ref mirror of the store's node data, kept current every render, so the
  // stable callbacks below always read the latest saved data without
  // needing to be recreated (which would blur focused inputs) on every
  // store update.
  const dataMapRef = useRef(new Map<string, CanvasNode["data"]>());
  dataMapRef.current = new Map(canvasNodes.map((n) => [n.id, n.data]));
  function findData(id: string) {
    return dataMapRef.current.get(id) ?? {};
  }

  const callbacks = useMemo(
    () => ({
      onTextChange: handleTextChange,
      onColorChange: handleColorChange,
      onShapeChange: handleShapeChange,
      onDelete: handleDelete,
    }),
    [handleTextChange, handleColorChange, handleShapeChange, handleDelete],
  );

  // Hydrate local node state from the store exactly once the initial load finishes.
  // Gated on canvasNodesLoaded (not canvasNodesLoading) because the loading
  // flag defaults to false *before* the fetch even starts — gating on it
  // let this effect race ahead and hydrate with an empty array before the
  // real data arrived.
  useEffect(() => {
    if (hydrated || !canvasNodesLoaded) return;
    setNodes(canvasNodes.map((n) => toFlowNode(n, callbacks)));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasNodesLoaded, hydrated]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));

    for (const change of changes) {
      if (change.type === "position" && change.position && !change.dragging) {
        updateCanvasNode(change.id, {
          position_x: change.position.x,
          position_y: change.position.y,
        });
      }
      if (change.type === "dimensions" && change.dimensions && !change.resizing) {
        updateCanvasNode(change.id, {
          width: change.dimensions.width,
          height: change.dimensions.height,
        });
      }
      if (change.type === "remove") {
        deleteCanvasNode(change.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNode = useCallback(
    async (type: CanvasNodeType) => {
      // Jitter so repeated adds don't stack exactly on top of each other.
      const jitter = () => (Math.random() - 0.5) * 120;
      const center = screenToFlowPosition({
        x: window.innerWidth / 2 + jitter(),
        y: window.innerHeight / 2 - 40 + jitter(),
      });
      const size = DEFAULT_SIZE[type];
      const initialData =
        type === "sticky"
          ? { text: "", color: "yellow" as StickyColor }
          : type === "shape"
            ? { text: "", shape: "rounded" as ShapeVariant }
            : { text: "" };

      const created = await createCanvasNode({
        type,
        position_x: center.x - size.width / 2,
        position_y: center.y - size.height / 2,
        width: size.width,
        height: size.height,
        data: initialData,
      });
      if (created) {
        setNodes((nds) => [
          ...nds.map((n) => ({ ...n, selected: false })),
          { ...toFlowNode(created, callbacks), selected: true },
        ]);
      }
    },
    [screenToFlowPosition, createCanvasNode, callbacks],
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <div>
          <h1 className="text-[18px] font-semibold text-zinc-900 dark:text-white/95">
            Visual Workspace
          </h1>
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            An infinite canvas for organizing ideas
          </p>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={[]}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          minZoom={0.2}
          maxZoom={2.5}
          deleteKeyCode={["Backspace", "Delete"]}
          proOptions={{ hideAttribution: true }}
          className="bg-zinc-50 dark:bg-zinc-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
          <Controls
            position="bottom-right"
            className="shadow-lg! rounded-xl! overflow-hidden! border! border-zinc-200! dark:border-zinc-800!"
          />
          <MiniMap
            position="top-right"
            pannable
            zoomable
            className="bg-white! dark:bg-zinc-900! border! border-zinc-200! dark:border-zinc-800! rounded-xl! shadow-sm!"
          />
        </ReactFlow>

        <CanvasToolbar onAddNode={addNode} />

        {hydrated && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <EmptyState
                icon={Shapes}
                title="Your canvas is empty"
                description="Add a sticky note, text, or shape from the toolbar below to start organizing your ideas."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function VisualWorkspace() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
