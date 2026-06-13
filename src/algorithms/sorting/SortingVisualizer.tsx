import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getFrames, SortFrame } from './frames';
import { ALGORITHMS, AlgoId } from '../../lib/algos';
import CodeDisplay from '../../components/CodeDisplay';

interface Props { algorithm: AlgoId; onBack: () => void; }

const ARRAY_SIZE = 60;
const randomArray = () => Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 270) + 20);

function barColor(i: number, f: SortFrame): string {
  if (f.sorted.includes(i)) return '#34d399';
  if (f.swapping.includes(i)) return '#f87171';
  if (f.comparing.includes(i)) return '#fbbf24';
  if (f.pivot === i) return '#fb923c';
  return '#334155';
}

const SPEEDS = [{ label: 'Slow', ms: 120 }, { label: 'Normal', ms: 30 }, { label: 'Fast', ms: 6 }];

export default function SortingVisualizer({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find(a => a.id === algorithm)!;
  const [frames, setFrames] = useState<SortFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = useCallback(() => {
    setFrames(getFrames(algorithm)(randomArray()));
    setFrameIdx(0);
    setIsPlaying(false);
  }, [algorithm]);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setFrameIdx(prev => {
        if (prev >= frames.length - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, SPEEDS[speedIdx].ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speedIdx, frames.length]);

  const frame = frames[frameIdx];
  const progress = frames.length > 1 ? Math.round((frameIdx / (frames.length - 1)) * 100) : 0;
  const isDone = frameIdx >= frames.length - 1;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white">{meta.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline">{meta.timeComplexity}</Badge>
              <Badge variant="outline">{meta.spaceComplexity} space</Badge>
              <span className="text-xs text-white/30 hidden sm:block">{meta.note}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Step <span className="text-white/70 font-mono">{frameIdx}</span>/<span className="font-mono">{frames.length - 1}</span></span>
            <span>·</span>
            <span>Sorted <span className="text-emerald-400 font-mono">{frame?.sorted.length ?? 0}</span></span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Bar chart */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-px h-64 bg-gray-900 rounded-xl px-3 pt-3 pb-2">
            {frame?.array.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[2px]"
                style={{
                  height: `${(val / 300) * 100}%`,
                  backgroundColor: barColor(i, frame),
                  transition: 'height 35ms linear, background-color 80ms',
                  minWidth: 0,
                }}
              />
            ))}
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, backgroundColor: meta.accentColor }} />
          </div>
        </div>

        {/* Controls + legend row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => { if (isDone) { setFrameIdx(0); setIsPlaying(true); return; } setIsPlaying(p => !p); }}
            className="min-w-[88px]"
            style={{ backgroundColor: `${meta.accentColor}22`, borderColor: `${meta.accentColor}44`, color: meta.accentColor }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? 'Pause' : isDone ? 'Replay' : 'Play'}
          </Button>
          <Button variant="outline" size="sm" onClick={generate}><RotateCcw size={14} /> New Array</Button>
          <Button variant="ghost" size="icon" disabled={frameIdx === 0}
            onClick={() => { setIsPlaying(false); setFrameIdx(i => Math.max(0, i - 1)); }}>
            <ChevronLeft size={15} />
          </Button>
          <Button variant="ghost" size="icon" disabled={isDone}
            onClick={() => { setIsPlaying(false); setFrameIdx(i => Math.min(frames.length - 1, i + 1)); }}>
            <ChevronRight size={15} />
          </Button>

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

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-white/50">
          {[['#fbbf24','Comparing'],['#f87171','Swapping'],['#34d399','Sorted'],['#fb923c','Pivot'],['#334155','Unsorted']].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
              {l}
            </span>
          ))}
        </div>

        {/* Code display */}
        <CodeDisplay algoId={algorithm} activeLine={frame?.activeLine ?? 0} />
      </div>
    </div>
  );
}
