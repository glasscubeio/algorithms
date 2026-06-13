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
import {
  getKMPFrames,
  KMPFrame,
  DEFAULT_TEXT,
  DEFAULT_PATTERN,
} from "./kmpFrames";
import { ALGORITHMS, AlgoId } from "../../lib/algos";
import CodeDisplay from "../../components/CodeDisplay";

interface Props {
  algorithm: AlgoId;
  onBack: () => void;
}
const SPEEDS = [
  { label: "Slow", ms: 500 },
  { label: "Normal", ms: 150 },
  { label: "Fast", ms: 40 },
];

export default function KMPVisualizer({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find((a) => a.id === algorithm)!;
  const [text, setText] = useState(DEFAULT_TEXT);
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [frames, setFrames] = useState<KMPFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAlgo = () => {
    const f = getKMPFrames(text, pattern);
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

  function textCellStyle(i: number): string {
    if (!frame || frame.phase === "failure") return "bg-gray-800 text-white/60";
    const { matchStart: ms, patIdx: pi, mismatch } = frame;
    // matched region
    if (frame.match?.some((s) => i >= s && i < s + pattern.length))
      return "bg-teal-500/50 border border-teal-400/50 text-white";
    if (i === frame.textIdx && mismatch)
      return "bg-red-500/40 border border-red-400 text-red-200";
    if (i === frame.textIdx)
      return "bg-yellow-500/40 border border-yellow-400 text-yellow-200";
    if (i >= ms && i < ms + pi) return "bg-blue-500/30 text-blue-200";
    return "bg-gray-800 text-white/60";
  }

  function patCellStyle(i: number): string {
    if (!frame || frame.phase === "failure") {
      if (i === frame?.patIdx)
        return "bg-yellow-500/30 border border-yellow-400 text-yellow-200";
      return "bg-gray-800 text-white/60";
    }
    if (i === frame.patIdx && frame.mismatch)
      return "bg-red-500/40 border border-red-400 text-red-200";
    if (i === frame.patIdx)
      return "bg-yellow-500/40 border border-yellow-400 text-yellow-200";
    if (i < frame.patIdx) return "bg-blue-500/30 text-blue-200";
    return "bg-gray-800 text-white/60";
  }

  const matchCount = frame?.match?.length ?? 0;

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
              <Badge variant="outline">
                {frame.phase === "failure"
                  ? "Building failure table"
                  : "Searching"}
              </Badge>
              {matchCount > 0 && (
                <Badge variant="success">
                  {matchCount} match{matchCount > 1 ? "es" : ""}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/30 block mb-1">Text</label>
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value.toUpperCase());
                reset();
              }}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-xs text-white/30 block mb-1">Pattern</label>
            <input
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value.toUpperCase());
                reset();
              }}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Text display */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-5 overflow-x-auto">
          <p className="text-xs text-white/30 mb-3">Text</p>
          <div className="flex gap-1 flex-wrap">
            {text.split("").map((ch, i) => (
              <div
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-mono font-bold transition-all duration-150 ${textCellStyle(i)}`}
              >
                {ch}
              </div>
            ))}
          </div>
        </div>

        {/* Pattern display */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-5 overflow-x-auto">
          <p className="text-xs text-white/30 mb-3">Pattern</p>
          <div className="flex gap-1 mb-4 flex-wrap">
            {pattern.split("").map((ch, i) => (
              <div
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-mono font-bold transition-all duration-150 ${patCellStyle(i)}`}
              >
                {ch}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mb-2">
            Failure table (prefix function)
          </p>
          <div className="flex gap-1 flex-wrap">
            {pattern.split("").map((ch, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-6 flex items-center justify-center text-xs font-mono bg-gray-800 rounded text-white/40">
                  {ch}
                </div>
                <div
                  className={`w-8 h-7 flex items-center justify-center rounded text-xs font-mono font-bold transition-all ${frame?.failureTable[i] != null ? "bg-indigo-900/60 border border-indigo-700/50 text-indigo-300" : "bg-gray-800 text-white/20"}`}
                >
                  {frame?.failureTable[i] ?? "·"}
                </div>
              </div>
            ))}
          </div>
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

        <div className="flex flex-wrap gap-4 text-xs text-white/50">
          {[
            ["bg-yellow-500/40 border-yellow-400", "Active"],
            ["bg-blue-500/30", "Matching"],
            ["bg-red-500/40 border-red-400", "Mismatch"],
            ["bg-teal-500/50", "Found"],
          ].map(([bg, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded border ${bg}`} />
              {label}
            </span>
          ))}
        </div>

        <CodeDisplay algoId={algorithm} activeLine={frame?.activeLine ?? 1} />
      </div>
    </div>
  );
}
