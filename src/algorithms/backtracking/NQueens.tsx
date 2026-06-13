import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { getNQueensFrames, NQueensFrame } from "./nqueensFrames";
import { ALGORITHMS, AlgoId } from "../../lib/algos";
import CodeDisplay from "../../components/CodeDisplay";

interface Props {
  algorithm: AlgoId;
  onBack: () => void;
}
const SPEEDS = [
  { label: "Slow", ms: 400 },
  { label: "Normal", ms: 120 },
  { label: "Fast", ms: 30 },
];
const N_OPTIONS = [4, 5, 6, 7, 8];

export default function NQueens({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find((a) => a.id === algorithm)!;
  const [n, setN] = useState(6);
  const [frames, setFrames] = useState<NQueensFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAlgo = () => {
    const f = getNQueensFrames(n);
    setFrames(f);
    setFrameIdx(0);
    setIsPlaying(false);
  };

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

  const reset = () => {
    setFrames([]);
    setFrameIdx(-1);
    setIsPlaying(false);
  };
  const frame = frameIdx >= 0 ? frames[frameIdx] : null;
  const isDone = frameIdx >= frames.length - 1 && frames.length > 0;
  const progress =
    frames.length > 1 ? Math.round((frameIdx / (frames.length - 1)) * 100) : 0;
  const queensPlaced = frame?.board.flat().filter((c) => c === 1).length ?? 0;

  function cellBg(val: 0 | 1 | 2, r: number, c: number): string {
    const isLight = (r + c) % 2 === 0;
    if (val === 1) return "bg-teal-500/80 border border-teal-400/50";
    if (frame?.backtracking && frame.row === r)
      return isLight ? "bg-red-500/20" : "bg-red-600/20";
    if (frame?.row === r && frame?.col === c && !frame.backtracking)
      return isLight ? "bg-yellow-400/30" : "bg-yellow-500/30";
    return isLight ? "bg-gray-700/50" : "bg-gray-800/80";
  }

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
                Queens placed{" "}
                <span className="text-teal-400 font-mono">
                  {queensPlaced}/{n}
                </span>
              </span>
              {frame.backtracking && (
                <Badge
                  variant="outline"
                  className="border-red-500/50 text-red-400"
                >
                  Backtracking
                </Badge>
              )}
              {frame.solved && <Badge variant="success">Solved!</Badge>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6 items-center">
        {/* Board */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-5 w-full max-w-sm">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
          >
            {Array.from({ length: n }, (_, r) =>
              Array.from({ length: n }, (_, c) => {
                const val = frame?.board[r]?.[c] ?? 0;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded flex items-center justify-center text-xl transition-all duration-150 ${cellBg(val as 0 | 1 | 2, r, c)}`}
                  >
                    {val === 1 ? "♛" : ""}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {frames.length > 0 && (
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden w-full">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                backgroundColor: meta.accentColor,
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap justify-center w-full">
          <div className="flex items-center gap-1 mr-2">
            <span className="text-xs text-white/30">N =</span>
            {N_OPTIONS.map((opt) => (
              <Button
                key={opt}
                size="sm"
                variant="ghost"
                className={
                  n === opt ? "text-white bg-white/10" : "text-white/40"
                }
                onClick={() => {
                  setN(opt);
                  reset();
                }}
              >
                {opt}
              </Button>
            ))}
          </div>
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
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw size={14} /> Reset
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

        <div className="flex flex-wrap gap-4 text-xs text-white/50 justify-center">
          {[
            ["bg-teal-500/80", "Queen placed"],
            ["bg-yellow-400/30", "Trying"],
            ["bg-red-500/20", "Backtracking"],
          ].map(([bg, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${bg}`} />
              {label}
            </span>
          ))}
        </div>

        <div className="w-full">
          <CodeDisplay algoId={algorithm} activeLine={frame?.activeLine ?? 1} />
        </div>
      </div>
    </div>
  );
}
