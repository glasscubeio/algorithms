import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

interface Props {
  onBack: () => void;
}

const SPEEDS = [
  { label: "Slow", ms: 600 },
  { label: "Normal", ms: 200 },
  { label: "Fast", ms: 70 },
];

export default function ConwaySquare({ onBack }: Props) {
  const [dims, setDims] = useState({ rows: 24, cols: 52 });

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setDims({ rows: 30, cols: 20 });
      else if (window.innerWidth < 1024) setDims({ rows: 24, cols: 36 });
      else setDims({ rows: 24, cols: 52 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { rows, cols } = dims;
  const emptyGrid = useCallback(
    () => Array.from({ length: rows }, () => Array(cols).fill(false)),
    [rows, cols],
  );

  const [grid, setGrid] = useState<boolean[][]>(() =>
    Array.from({ length: 24 }, () => Array(52).fill(false)),
  );
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);

  useEffect(() => {
    setGrid(emptyGrid());
    setGeneration(0);
  }, [emptyGrid]);

  const toggle = (r: number, c: number) =>
    setGrid((g) => {
      const n = g.map((row) => [...row]);
      n[r][c] = !n[r][c];
      return n;
    });

  const countNeighbors = (g: boolean[][], r: number, c: number) => {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr,
          nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc]) count++;
      }
    return count;
  };

  const step = useCallback(() => {
    setGrid((g) =>
      g.map((row, r) =>
        row.map((cell, c) => {
          const n = countNeighbors(g, r, c);
          return cell ? n === 2 || n === 3 : n === 3;
        }),
      ),
    );
    setGeneration((gen) => gen + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(step, SPEEDS[speedIdx].ms);
    return () => clearInterval(id);
  }, [isRunning, step, speedIdx]);

  const seed = () => {
    setGrid(
      Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random() < 0.28),
      ),
    );
    setGeneration(0);
    setIsRunning(false);
  };

  const reset = () => {
    setGrid(emptyGrid());
    setIsRunning(false);
    setGeneration(0);
  };
  const alive = grid.flat().filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white">
              Conway's Game of Life
            </h1>
            <p className="text-xs text-white/40">
              Square Grid · 8-neighbor (Moore)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>
              Gen <span className="text-white/70 font-mono">{generation}</span>
            </span>
            <span>·</span>
            <span>
              Alive <span className="text-blue-400 font-mono">{alive}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsRunning((r) => !r)}
              size="sm"
              className={
                isRunning
                  ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                  : ""
              }
            >
              {isRunning ? <Pause size={15} /> : <Play size={15} />}
              {isRunning ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" size="sm" onClick={seed}>
              <Sparkles size={15} /> Seed
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw size={15} /> Reset
            </Button>
          </div>
          {/* Speed */}
          <div className="flex items-center gap-1">
            {SPEEDS.map((s, i) => (
              <Button
                key={s.label}
                variant="ghost"
                size="sm"
                onClick={() => setSpeedIdx(i)}
                className={
                  speedIdx === i
                    ? "text-blue-400 bg-blue-500/10"
                    : "text-white/30"
                }
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="inline-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "2px",
            backgroundColor: "#0f172a",
            padding: "2px",
            borderRadius: "8px",
          }}
        >
          {grid.map((row, r) =>
            row.map((alive, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => toggle(r, c)}
                className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-xs cursor-pointer transition-colors duration-75
                  ${
                    alive
                      ? "bg-blue-400 shadow-[0_0_3px_#60a5fa80]"
                      : "bg-gray-900 hover:bg-gray-700"
                  }`}
              />
            )),
          )}
        </div>
      </div>

      <p className="text-center text-xs text-white/20 pb-4">
        Click cells to draw · Press Play to run
      </p>
    </div>
  );
}
