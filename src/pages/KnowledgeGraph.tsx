import { useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Search, ZoomIn, ZoomOut, Maximize2, Link2 } from "lucide-react";
import { useStore } from "../lib/store";
import { useState } from "react";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  linked: boolean;
}

interface GraphEdge {
  source: string;
  target: string;
}

// Nodes are colored by whether they're actually linked to another note —
// not by any real "category", since notes don't have one.
const LINKED_COLOR = "#4F7DF3";
const UNLINKED_COLOR = "#9CA3AF";

export function KnowledgeGraph() {
  const { notes, noteLinks } = useStore();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const nodesRef = useRef<GraphNode[]>([]);
  const drawRef = useRef<() => void>(() => {});

  const { nodes, edges } = useMemo(() => {
    const linkedIds = new Set<string>();
    for (const link of noteLinks) {
      linkedIds.add(link.source_id);
      linkedIds.add(link.target_id);
    }

    const graphNodes: GraphNode[] = notes.map((note, i) => {
      const angle = (i / notes.length) * Math.PI * 2;
      const radius = 200 + ((i * 73 + 37) % 100);
      const linked = linkedIds.has(note.id);
      return {
        id: note.id,
        label: note.title || "Untitled",
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        color: linked ? LINKED_COLOR : UNLINKED_COLOR,
        radius: 30 + Math.min(note.content?.length ?? 0, 500) / 50,
        linked,
      };
    });

    const graphEdges: GraphEdge[] = noteLinks.map((link) => ({
      source: link.source_id,
      target: link.target_id,
    }));

    return { nodes: graphNodes, edges: graphEdges };
  }, [notes, noteLinks]);

  useEffect(() => {
    nodesRef.current = nodes.map((n) => ({ ...n }));
  }, [nodes]);

  const simulateForces = useCallback(() => {
    const ns = nodesRef.current;
    if (ns.length === 0) return;
    const damping = 0.9;
    const repulsion = 5000;
    const attraction = 0.005;
    const centerForce = 0.01;

    for (let i = 0; i < ns.length; i++) {
      ns[i].vx -= ns[i].x * centerForce;
      ns[i].vy -= ns[i].y * centerForce;

      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[j].x - ns[i].x;
        const dy = ns[j].y - ns[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        ns[i].vx -= fx;
        ns[i].vy -= fy;
        ns[j].vx += fx;
        ns[j].vy += fy;
      }
    }

    for (const edge of edges) {
      const source = ns.find((n) => n.id === edge.source);
      const target = ns.find((n) => n.id === edge.target);
      if (source && target) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        source.vx += dx * attraction;
        source.vy += dy * attraction;
        target.vx -= dx * attraction;
        target.vy -= dy * attraction;
      }
    }

    for (let i = 0; i < ns.length; i++) {
      ns[i].vx *= damping;
      ns[i].vy *= damping;
      ns[i].x += ns[i].vx;
      ns[i].y += ns[i].vy;
    }
  }, [edges]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2 + panOffset.x;
    const cy = h / 2 + panOffset.y;
    const isDark = document.documentElement.classList.contains("dark");

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = isDark ? "#1A1A1A" : "#F8F9FA";
    ctx.fillRect(0, 0, w, h);

    const ns = nodesRef.current;

    // Draw edges
    for (const edge of edges) {
      const source = ns.find((n) => n.id === edge.source);
      const target = ns.find((n) => n.id === edge.target);
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(cx + source.x * zoom, cy + source.y * zoom);
        ctx.lineTo(cx + target.x * zoom, cy + target.y * zoom);
        ctx.strokeStyle = isDark
          ? "rgba(75, 85, 99, 0.4)"
          : "rgba(200, 204, 211, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const node of ns) {
      const x = cx + node.x * zoom;
      const y = cy + node.y * zoom;
      const r = node.radius * zoom;
      const isHovered = hoveredNode === node.id;
      const isSearched =
        search && node.label.toLowerCase().includes(search.toLowerCase());

      // Glow
      if (isHovered || isSearched) {
        ctx.beginPath();
        ctx.arc(x, y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = node.color + "30";
        ctx.fill();
      }

      // Circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = isHovered || isSearched ? node.color : node.color + "CC";
      ctx.fill();

      // Label
      ctx.fillStyle = "white";
      ctx.font = `${Math.max(10, 12 * zoom)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const maxChars = Math.floor(r / (5 * zoom));
      const label =
        node.label.length > maxChars
          ? node.label.substring(0, maxChars) + "..."
          : node.label;
      ctx.fillText(label, x, y);
    }

    simulateForces();
    animRef.current = requestAnimationFrame(() => drawRef.current());
  }, [edges, zoom, hoveredNode, search, panOffset, simulateForces]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging.current) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMouse.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = canvas.width / 2 + panOffset.x;
    const cy = canvas.height / 2 + panOffset.y;

    let found: string | null = null;
    for (const node of nodesRef.current) {
      const x = cx + node.x * zoom;
      const y = cy + node.y * zoom;
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (dist < node.radius * zoom) {
        found = node.id;
        break;
      }
    }
    setHoveredNode(found);
    canvas.style.cursor = found
      ? "pointer"
      : isDragging.current
        ? "grabbing"
        : "grab";
  };

  const handleClick = () => {
    if (hoveredNode) {
      navigate(`/notes/${hoveredNode}`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
        <div>
          <h1 className="text-[18px] font-semibold text-zinc-900 dark:text-white/95">
            Knowledge Graph
          </h1>
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Visualize connections between your notes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nodes..."
              className="pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-48"
            />
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 px-2 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
            >
              <ZoomIn size={14} />
            </button>
          </div>
          <button
            onClick={() => {
              setZoom(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {notes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-900/70 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-10 text-center max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Search
                  size={22}
                  className="text-zinc-400 dark:text-zinc-500"
                />
              </div>
              <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-white/90 mb-1.5">
                No notes to visualize
              </h3>
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">
                Create notes and link them to see your knowledge graph
              </p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseDown={(e) => {
              if (!hoveredNode) {
                isDragging.current = true;
                lastMouse.current = { x: e.clientX, y: e.clientY };
              }
            }}
            onMouseUp={() => {
              isDragging.current = false;
            }}
            onMouseLeave={() => {
              isDragging.current = false;
              setHoveredNode(null);
            }}
            onWheel={(e) => {
              e.preventDefault();
              setZoom((z) => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
            }}
            className="w-full h-full"
          />
        )}

        {/* Hint: notes exist but nothing is linked yet */}
        {notes.length > 0 && edges.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-zinc-900/90 rounded-full pl-3 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-[min(90vw,26rem)]"
          >
            <Link2 size={14} className="text-primary-500 shrink-0" />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Nothing's connected yet — open a note and click{" "}
              <strong className="text-zinc-900 dark:text-white font-medium">
                Link a note
              </strong>{" "}
              to map connections here.
            </span>
          </motion.div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-6 bg-white dark:bg-zinc-900/70 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <h4 className="text-xs font-semibold text-zinc-900 dark:text-white mb-2">
            How to read this
          </h4>
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: LINKED_COLOR }}
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Linked note
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: UNLINKED_COLOR }}
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Not linked yet
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-px bg-zinc-400 dark:bg-zinc-600 shrink-0" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Connection
              </span>
            </div>
          </div>
          <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800 leading-relaxed">
            Drag to pan · Scroll to zoom · Click a note to open it
          </p>
        </motion.div>
      </div>
    </div>
  );
}
