import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getKnapsackFrames, KnapsackFrame, DEFAULT_ITEMS, DEFAULT_CAPACITY } from './knapsackFrames';
import { ALGORITHMS, AlgoId } from '../../lib/algos';
import CodeDisplay from '../../components/CodeDisplay';

interface Props { algorithm: AlgoId; onBack: () => void; }

const SPEEDS = [{ label: 'Slow', ms: 300 }, { label: 'Normal', ms: 80 }, { label: 'Fast', ms: 20 }];

export default function KnapsackDP({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find(a => a.id === algorithm)!;
  const [frames, setFrames] = useState<KnapsackFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAlgo = () => {
    const f = getKnapsackFrames(DEFAULT_ITEMS, DEFAULT_CAPACITY);
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

  const cellStyle = (i: number, j: number) => {
    if (!frame) return 'bg-gray-800 text-white/20';
    const [ci, cj] = frame.currentCell ?? [-1, -1];
    if (ci === i && cj === j) {
      return frame.takingItem
        ? 'bg-teal-500/40 border border-teal-400 text-teal-200'
        : 'bg-yellow-500/30 border border-yellow-400 text-yellow-300';
    }
    // reading cell: [i-1][j] and [i-1][j-w]
    if (ci === i && frame.currentCell) {
      const w = DEFAULT_ITEMS[i - 1]?.weight ?? 0;
      if ((i - 1 === i - 1) && (j === cj || j === cj - w) && i > 0) return 'bg-blue-500/20 text-blue-300';
    }
    if (frame.table[i][j] > 0) return 'bg-gray-700/80 text-white/80';
    return 'bg-gray-800 text-white/20';
  };

  const n = DEFAULT_ITEMS.length;
  const W = DEFAULT_CAPACITY;

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
          {frame && (
            <div className="text-xs text-white/40">
              Capacity <span className="font-mono text-white">{W}</span> · Max value{' '}
              <span style={{ color: meta.accentColor }} className="font-mono font-bold">
                {frame.table[n]?.[W] ?? 0}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <div className="flex gap-6 flex-wrap">
          {/* Items sidebar */}
          <div className="bg-gray-900 rounded-2xl border border-white/5 p-4 min-w-[160px]">
            <p className="text-xs text-white/30 mb-3">Items</p>
            <div className="flex flex-col gap-2">
              {DEFAULT_ITEMS.map((item, i) => {
                const isActive = frame?.currentCell?.[0] === i + 1;
                return (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-gray-800/60'}`}>
                    <span className="text-lg">{item.label}</span>
                    <div className="text-xs text-white/50">
                      <div>wt: <span className="text-white font-mono">{item.weight}</span></div>
                      <div>val: <span className="text-green-400 font-mono">{item.value}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DP table */}
          <div className="flex-1 bg-gray-900 rounded-2xl border border-white/5 p-4 overflow-x-auto">
            <p className="text-xs text-white/30 mb-3">dp[item][capacity]</p>
            <table className="text-xs border-separate" style={{ borderSpacing: '2px' }}>
              <thead>
                <tr>
                  <th className="text-white/20 px-2 py-1 text-left">item\cap</th>
                  {Array.from({ length: W + 1 }, (_, j) => (
                    <th key={j} className="text-white/30 px-2 py-1 font-mono">{j}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: n + 1 }, (_, i) => (
                  <tr key={i}>
                    <td className="text-white/30 pr-3 py-1 text-right font-mono">
                      {i === 0 ? '∅' : DEFAULT_ITEMS[i - 1].label}
                    </td>
                    {Array.from({ length: W + 1 }, (_, j) => (
                      <td key={j} className={`w-9 h-7 text-center rounded font-mono transition-all duration-150 ${cellStyle(i, j)}`}>
                        {frame ? frame.table[i][j] : (i === 0 ? '0' : '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {frames.length > 0 && (
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, backgroundColor: meta.accentColor }} />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
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

        <CodeDisplay algoId={algorithm} activeLine={frame?.activeLine ?? 2} />
      </div>
    </div>
  );
}
