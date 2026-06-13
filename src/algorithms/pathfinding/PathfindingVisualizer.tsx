import { useState, useCallback, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Shuffle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  getDijkstraFrames,
  getAStarFrames,
  randomWeights,
  PathfindingFrame,
  GridCell,
} from "./pathfindingFrames";
import { ALGORITHMS, AlgoId } from "../../lib/algos";
import CodeDisplay from "../../components/CodeDisplay";

interface Props {
  algorithm: AlgoId;
  onBack: () => void;
}
type Mode = "wall" | "start" | "end" | "erase";

const ROWS = 16,
  COLS = 36;
const DEFAULT_START: [number, number] = [Math.floor(ROWS / 2), 2];
const DEFAULT_END: [number, number] = [Math.floor(ROWS / 2), COLS - 3];
const SPEEDS = [
  { label: "Slow", ms: 60 },
  { label: "Normal", ms: 18 },
  { label: "Fast", ms: 4 },
];
const INF = 999999;

function emptyGrid(): GridCell[][] {
  return Array.from(
    { length: ROWS },
    (_, r) =>
      Array.from({ length: COLS }, (_, c) => {
        if (r === DEFAULT_START[0] && c === DEFAULT_START[1]) return "start";
        if (r === DEFAULT_END[0] && c === DEFAULT_END[1]) return "end";
        return "empty";
      }) as GridCell[],
  );
}

function randomMaze(rows: number, cols: number): GridCell[][] {
  return Array.from(
    { length: rows },
    (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1)
          return "wall";
        return Math.random() < 0.28 ? "wall" : "empty";
      }) as GridCell[],
  );
}

function weightColor(w: number): string {
  const colors = [
    "",
    "bg-gray-800",
    "bg-blue-950",
    "bg-blue-900",
    "bg-blue-800",
    "bg-blue-700",
  ];
  return colors[w] ?? "bg-gray-800";
}

function cellVisual(
  base: GridCell,
  idx: number,
  weights: number[][],
  frame: PathfindingFrame | null,
  _rows: number,
  cols: number,
): { bg: string; text?: string } {
  const r = Math.floor(idx / cols),
    c = idx % cols;
  const w = weights[r]?.[c] ?? 1;
  if (base === "wall") return { bg: "bg-gray-600" };
  if (base === "start") return { bg: "bg-emerald-500", text: "▶" };
  if (base === "end")
    return { bg: frame?.found ? "bg-orange-400" : "bg-red-500", text: "◆" };
  if (!frame) return { bg: weightColor(w), text: w > 1 ? String(w) : "" };
  if (frame.path?.includes(idx)) return { bg: "bg-yellow-400" };
  if (frame.current === idx) return { bg: "bg-white" };
  if (frame.frontier.includes(idx)) return { bg: "bg-orange-400" };
  if (frame.visited.has(idx)) {
    const d = frame.distances[idx];
    return {
      bg: d < INF ? "bg-teal-700/90" : "bg-teal-800/60",
      text: d < INF && d < 99 ? String(d) : "",
    };
  }
  return { bg: weightColor(w), text: w > 1 ? String(w) : "" };
}

export default function PathfindingVisualizer({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find((a) => a.id === algorithm)!;
  const [grid, setGrid] = useState<GridCell[][]>(emptyGrid);
  const [weights, setWeights] = useState<number[][]>(() =>
    randomWeights(ROWS, COLS),
  );
  const [start, setStart] = useState<[number, number]>(DEFAULT_START);
  const [end, setEnd] = useState<[number, number]>(DEFAULT_END);
  const [mode, setMode] = useState<Mode>("wall");
  const [frames, setFrames] = useState<PathfindingFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const drawingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAlgo = useCallback(() => {
    const fn =
      (algorithm as string) === "dijkstra" ? getDijkstraFrames : getAStarFrames;
    const f = fn(weights, grid, ROWS, COLS, start[0], start[1], end[0], end[1]);
    setFrames(f);
    setFrameIdx(0);
    setIsPlaying(false);
  }, [weights, grid, start, end, algorithm]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isPlaying || frameIdx < 0) return;
    intervalRef.current = setInterval(() => {
      setFrameIdx((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, SPEEDS[speedIdx].ms);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speedIdx, frames.length, frameIdx]);

  const resetViz = () => {
    setFrames([]);
    setFrameIdx(-1);
    setIsPlaying(false);
  };

  const clearAll = () => {
    setGrid(emptyGrid());
    setStart(DEFAULT_START);
    setEnd(DEFAULT_END);
    setWeights(randomWeights(ROWS, COLS));
    resetViz();
  };

  const genMaze = () => {
    const m = randomMaze(ROWS, COLS);
    m[start[0]][start[1]] = "start";
    m[end[0]][end[1]] = "end";
    setGrid(m);
    setWeights(randomWeights(ROWS, COLS));
    resetViz();
  };

  const applyCell = (r: number, c: number) => {
    if (frameIdx >= 0) return;
    setGrid((g) => {
      const n = g.map((row) => [...row]) as GridCell[][];
      if (mode === "start") {
        n[start[0]][start[1]] = "empty";
        n[r][c] = "start";
        setStart([r, c]);
      } else if (mode === "end") {
        n[end[0]][end[1]] = "empty";
        n[r][c] = "end";
        setEnd([r, c]);
      } else if (mode === "wall" && n[r][c] === "empty") {
        n[r][c] = "wall";
      } else if (mode === "erase" && n[r][c] !== "start" && n[r][c] !== "end") {
        n[r][c] = "empty";
      }
      return n;
    });
  };

  const frame = frameIdx >= 0 ? frames[frameIdx] : null;
  const isDone = frameIdx >= frames.length - 1 && frames.length > 0;
  const progress =
    frames.length > 1 ? Math.round((frameIdx / (frames.length - 1)) * 100) : 0;
  const activeLine = frame?.activeLine ?? 1;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white">{meta.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline">{meta.timeComplexity}</Badge>
              <Badge variant="outline">{meta.spaceComplexity} space</Badge>
            </div>
          </div>
          {frame && (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>
                Visited{" "}
                <span className="text-teal-400 font-mono">
                  {frame.visited.size}
                </span>
              </span>
              <span>·</span>
              <span>
                Frontier{" "}
                <span className="text-orange-400 font-mono">
                  {frame.frontier.length}
                </span>
              </span>
              {frame.found && <Badge variant="success">Path found!</Badge>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        <div
          className="inline-grid rounded-xl overflow-hidden border border-white/5 w-full"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: "1px",
            backgroundColor: "#111827",
          }}
          onMouseLeave={() => {
            drawingRef.current = false;
          }}
        >
          {grid.map((row, r) =>
            row.map((base, c) => {
              const fi = r * COLS + c;
              const { bg, text } = cellVisual(
                base,
                fi,
                weights,
                frame,
                ROWS,
                COLS,
              );
              return (
                <div
                  key={`${r}-${c}`}
                  className={`aspect-square cursor-pointer transition-colors duration-75 ${bg} flex items-center justify-center`}
                  style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)" }}
                  onMouseDown={() => {
                    drawingRef.current = true;
                    applyCell(r, c);
                  }}
                  onMouseEnter={() => {
                    if (drawingRef.current) applyCell(r, c);
                  }}
                  onMouseUp={() => {
                    drawingRef.current = false;
                  }}
                >
                  {text || null}
                </div>
              );
            }),
          )}
        </div>

        {frames.length > 0 && (
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                backgroundColor: meta.accentColor,
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {(["wall", "start", "end", "erase"] as Mode[]).map((m) => (
            <Button
              key={m}
              size="sm"
              variant="outline"
              className={
                mode === m ? "bg-white/10 text-white" : "text-white/40"
              }
              onClick={() => setMode(m)}
            >
              {m === "wall"
                ? "✏ Wall"
                : m === "start"
                  ? "⬤ Start"
                  : m === "end"
                    ? "⬤ End"
                    : "⌫ Erase"}
            </Button>
          ))}
          <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
          <Button size="sm" variant="outline" onClick={genMaze}>
            <Shuffle size={14} /> Maze
          </Button>
          <Button size="sm" variant="outline" onClick={clearAll}>
            <RotateCcw size={14} /> Clear
          </Button>
          <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
          <Button
            size="sm"
            onClick={() => {
              if (frameIdx < 0 || isDone) {
                runAlgo();
                setTimeout(() => setIsPlaying(true), 50);
                return;
              }
              setIsPlaying((p) => !p);
            }}
            style={{
              backgroundColor: `${meta.accentColor}22`,
              borderColor: `${meta.accentColor}44`,
              color: meta.accentColor,
            }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying
              ? "Pause"
              : isDone
                ? "Re-run"
                : frameIdx >= 0
                  ? "Resume"
                  : "Run"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={frameIdx <= 0}
            onClick={() => {
              setIsPlaying(false);
              setFrameIdx((i) => Math.max(0, i - 1));
            }}
          >
            <ChevronLeft size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDone || frameIdx < 0}
            onClick={() => {
              setIsPlaying(false);
              setFrameIdx((i) => Math.min(frames.length - 1, i + 1));
            }}
          >
            <ChevronRight size={15} />
          </Button>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-white/30 mr-1">Speed:</span>
            {SPEEDS.map((s, i) => (
              <Button
                key={s.label}
                variant="ghost"
                size="sm"
                onClick={() => setSpeedIdx(i)}
                className={
                  speedIdx === i ? "text-white bg-white/10" : "text-white/40"
                }
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-white/50">
          {[
            ["bg-white", "Current"],
            ["bg-orange-400", "Frontier"],
            ["bg-teal-700", "Visited"],
            ["bg-yellow-400", "Path"],
            ["bg-emerald-500", "Start"],
            ["bg-red-500", "End"],
            ["bg-gray-600", "Wall"],
            ["bg-blue-800", "High cost"],
          ].map(([bg, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${bg}`} />
              {label}
            </span>
          ))}
        </div>

        <CodeDisplay algoId={algorithm} activeLine={activeLine} />
      </div>
    </div>
  );
}
