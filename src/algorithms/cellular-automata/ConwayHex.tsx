import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

interface Props {
  onBack: () => void;
}

// Axial coordinate hex grid (pointy-top)
// Valid cells: max(|q|, |r|, |q+r|) <= N  → forms a regular hexagon shape

const HEX_R = 15; // cell radius in SVG units
const N = 9; // grid radius in hex units → 271 cells
const SQRT3 = Math.sqrt(3);
const RR = HEX_R * 0.88; // render radius (leaves a gap between cells)

// 6 axial neighbor directions for a hex grid
const HEX_DIRS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
];

function isValid(q: number, r: number): boolean {
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) <= N;
}

// Pixel position of hex center from axial coords (pointy-top)
function toPixel(
  q: number,
  r: number,
  cx: number,
  cy: number,
): [number, number] {
  return [cx + HEX_R * (SQRT3 * q + (SQRT3 / 2) * r), cy + HEX_R * (1.5 * r)];
}

// SVG polygon points for a pointy-top hex
function hexPoints(cx: number, cy: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + RR * Math.cos(a)).toFixed(2)},${(cy + RR * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

// Pre-compute all valid cells once
const ALL_CELLS: [number, number][] = [];
for (let q = -N; q <= N; q++)
  for (let r = -N; r <= N; r++) if (isValid(q, r)) ALL_CELLS.push([q, r]);

const VALID_SET = new Set(ALL_CELLS.map(([q, r]) => `${q},${r}`));

// SVG canvas size
const SVG_CX = N * SQRT3 * HEX_R + HEX_R * 2;
const SVG_CY = N * 1.5 * HEX_R + HEX_R * 2;
const SVG_W = SVG_CX * 2;
const SVG_H = SVG_CY * 2;

const SPEEDS = [
  { label: "Slow", ms: 600 },
  { label: "Normal", ms: 250 },
  { label: "Fast", ms: 90 },
];

export default function ConwayHex({ onBack }: Props) {
  const [aliveSet, setAliveSet] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const drawState = useRef<boolean | null>(null);

  const step = useCallback(() => {
    setAliveSet((current) => {
      // Collect candidate cells: all alive + their neighbors
      const candidates = new Set<string>();
      for (const ck of current) {
        candidates.add(ck);
        const [q, r] = ck.split(",").map(Number);
        for (const [dq, dr] of HEX_DIRS) {
          const nk = `${q + dq},${r + dr}`;
          if (VALID_SET.has(nk)) candidates.add(nk);
        }
      }

      const next = new Set<string>();
      for (const ck of candidates) {
        if (!VALID_SET.has(ck)) continue;
        const [q, r] = ck.split(",").map(Number);
        const live = HEX_DIRS.filter(([dq, dr]) =>
          current.has(`${q + dq},${r + dr}`),
        ).length;
        const isAlive = current.has(ck);
        if (isAlive ? live === 2 || live === 3 : live === 3) next.add(ck);
      }
      return next;
    });
    setGeneration((g) => g + 1);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(step, SPEEDS[speedIdx].ms);
    return () => clearInterval(id);
  }, [isRunning, step, speedIdx]);

  const seed = () => {
    setAliveSet(
      new Set(
        ALL_CELLS.filter(() => Math.random() < 0.3).map(
          ([q, r]) => `${q},${r}`,
        ),
      ),
    );
    setGeneration(0);
    setIsRunning(false);
  };

  const reset = () => {
    setAliveSet(new Set());
    setIsRunning(false);
    setGeneration(0);
  };

  const toggle = (q: number, r: number) => {
    const ck = `${q},${r}`;
    setAliveSet((s) => {
      const n = new Set(s);
      if (n.has(ck)) n.delete(ck);
      else n.add(ck);
      return n;
    });
  };

  const alive = aliveSet.size;

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
              Hexagonal Grid · 6-neighbor · {ALL_CELLS.length} cells
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>
              Gen <span className="text-white/70 font-mono">{generation}</span>
            </span>
            <span>·</span>
            <span>
              Alive <span className="text-purple-400 font-mono">{alive}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsRunning((r) => !r)}
              size="sm"
              className={
                isRunning
                  ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
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
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-white/30"
                }
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Hex SVG grid */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="max-w-full touch-none"
          style={{ maxHeight: "80vh" }}
          onMouseLeave={() => {
            drawState.current = null;
          }}
        >
          <defs>
            <filter id="hex-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {ALL_CELLS.map(([q, r]) => {
            const ck = `${q},${r}`;
            const isAlive = aliveSet.has(ck);
            const [cx, cy] = toPixel(q, r, SVG_CX, SVG_CY);
            return (
              <polygon
                key={ck}
                points={hexPoints(cx, cy)}
                fill={isAlive ? "#a855f7" : "#1e293b"}
                stroke={isAlive ? "#c084fc" : "#0f172a"}
                strokeWidth={isAlive ? 0.6 : 0.4}
                filter={isAlive ? "url(#hex-glow)" : undefined}
                style={{
                  cursor: "pointer",
                  transition: "fill 0.08s, stroke 0.08s",
                }}
                onMouseDown={() => {
                  drawState.current = !isAlive;
                  toggle(q, r);
                }}
                onMouseEnter={() => {
                  if (
                    drawState.current !== null &&
                    isAlive !== drawState.current
                  )
                    toggle(q, r);
                }}
                onMouseUp={() => {
                  drawState.current = null;
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  toggle(q, r);
                }}
              />
            );
          })}
        </svg>
      </div>

      <p className="text-center text-xs text-white/20 pb-4">
        Click or drag to draw · Press Play to run
      </p>
    </div>
  );
}
