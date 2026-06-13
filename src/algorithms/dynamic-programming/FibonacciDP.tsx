import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getFibFrames, FibFrame } from './fibFrames';
import { ALGORITHMS, AlgoId } from '../../lib/algos';
import CodeDisplay from '../../components/CodeDisplay';

interface Props { algorithm: AlgoId; onBack: () => void; }

const SPEEDS = [{ label: 'Slow', ms: 500 }, { label: 'Normal', ms: 150 }, { label: 'Fast', ms: 40 }];
const N_OPTIONS = [8, 12, 16, 20];

export default function FibonacciDP({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find(a => a.id === algorithm)!;
  const [n, setN] = useState(12);
  const [frames, setFrames] = useState<FibFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAlgo = () => {
    const f = getFibFrames(n);
    setFrames(f); setFrameIdx(0); setIsPlaying(false);
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isPlaying || frameIdx < 0) return;
    intervalRef.current = setInterval(() => {
      setFrameIdx(prev => {
        if (prev >= frames.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, SPEEDS[speedIdx].ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speedIdx, frames.length, frameIdx]);

  const reset = () => { setFrames([]); setFrameIdx(-1); setIsPlaying(false); };
  const frame = frameIdx >= 0 ? frames[frameIdx] : null;
  const isDone = frameIdx >= frames.length - 1 && frames.length > 0;
  const progress = frames.length > 1 ? Math.round((frameIdx / (frames.length - 1)) * 100) : 0;

  const cellColor = (i: number) => {
    if (!frame) return 'bg-gray-800 text-white/20';
    if (frame.current === i) return 'bg-yellow-500/30 border border-yellow-400 text-yellow-300';
    if (frame.reading.includes(i)) return 'bg-blue-500/30 border border-blue-400 text-blue-300';
    if (frame.table[i] !== null) return 'bg-teal-900/60 border border-teal-700/50 text-teal-300';
    return 'bg-gray-800 text-white/20';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft size={16} /> Back</Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white">{meta.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline">{meta.timeComplexity}</Badge>
              <Badge variant="outline">{meta.spaceComplexity} space</Badge>
            </div>
          </div>
          {frame && frame.table[n] !== null && (
            <div className="text-xs text-white/40">
              F({n}) = <span style={{ color: meta.accentColor }} className="font-mono text-sm font-bold">{frame.table[n]}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* DP table */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-6 overflow-x-auto">
          <p className="text-xs text-white/30 mb-4">Memoization table — F(i)</p>
          <div className="flex gap-2 min-w-max">
            {Array.from({ length: (frame?.n ?? n) + 1 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-mono font-bold transition-all duration-200 ${cellColor(i)}`}>
                  {frame?.table[i] != null ? frame.table[i] : '?'}
                </div>
                <span className="text-xs text-white/30">F({i})</span>
              </div>
            ))}
          </div>
          {/* Dependency arrows for current cell */}
          {frame?.reading.length === 2 && frame.current !== null && (
            <div className="mt-4 text-xs text-white/40 text-center">
              F({frame.current}) = F({frame.reading[0]}) + F({frame.reading[1]})
              {frame.table[frame.current] != null && (
                <span className="ml-2 text-yellow-400 font-mono">= {frame.table[frame.reading[0]]! + frame.table[frame.reading[1]]!}</span>
              )}
            </div>
          )}
        </div>

        {frames.length > 0 && (
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, backgroundColor: meta.accentColor }} />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 mr-2">
            <span className="text-xs text-white/30">n =</span>
            {N_OPTIONS.map(opt => (
              <Button key={opt} size="sm" variant="ghost"
                className={n === opt ? 'text-white bg-white/10' : 'text-white/40'}
                onClick={() => { setN(opt); reset(); }}>
                {opt}
              </Button>
            ))}
          </div>
          <Button size="sm"
            onClick={() => {
              if (frameIdx < 0 || isDone) { runAlgo(); setTimeout(() => setIsPlaying(true), 50); return; }
              setIsPlaying(p => !p);
            }}
            style={{ backgroundColor: `${meta.accentColor}22`, borderColor: `${meta.accentColor}44`, color: meta.accentColor }}>
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? 'Pause' : isDone ? 'Re-run' : frameIdx >= 0 ? 'Resume' : 'Run'}
          </Button>
          <Button variant="ghost" size="icon" disabled={frameIdx <= 0}
            onClick={() => { setIsPlaying(false); setFrameIdx(i => Math.max(0, i - 1)); }}>
            <ChevronLeft size={15} />
          </Button>
          <Button variant="ghost" size="icon" disabled={isDone || frameIdx < 0}
            onClick={() => { setIsPlaying(false); setFrameIdx(i => Math.min(frames.length - 1, i + 1)); }}>
            <ChevronRight size={15} />
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw size={14} /> Reset</Button>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-white/30 mr-1">Speed:</span>
            {SPEEDS.map((s, i) => (
              <Button key={s.label} variant="ghost" size="sm" onClick={() => setSpeedIdx(i)}
                className={speedIdx === i ? 'text-white bg-white/10' : 'text-white/40'}>
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-white/50">
          {[['bg-yellow-500/30 border-yellow-400','Current'],['bg-blue-500/30 border-blue-400','Reading'],['bg-teal-900/60 border-teal-700/50','Computed']].map(([cls, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-4 h-4 rounded border ${cls}`} />{label}
            </span>
          ))}
        </div>

        <CodeDisplay algoId={algorithm} activeLine={frame?.activeLine ?? 1} />
      </div>
    </div>
  );
}
