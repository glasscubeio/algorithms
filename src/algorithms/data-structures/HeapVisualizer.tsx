import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getBuildHeapFrames, getInsertHeapFrames, getExtractMaxFrames, HeapFrame, HeapOp, DEFAULT_HEAP_ARR, DEFAULT_INSERT_VAL } from './heapFrames';
import { ALGORITHMS, AlgoId } from '../../lib/algos';
import CodeDisplay from '../../components/CodeDisplay';

interface Props { algorithm: AlgoId; onBack: () => void; }
const SPEEDS = [{ label: 'Slow', ms: 500 }, { label: 'Normal', ms: 150 }, { label: 'Fast', ms: 40 }];
const OPERATIONS: { key: HeapOp; label: string }[] = [
  { key: 'build', label: 'Build Heap' },
  { key: 'insert', label: 'Insert 10' },
  { key: 'extract', label: 'Extract Max' },
];

export default function HeapVisualizer({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find(a => a.id === algorithm)!;
  const [op, setOp] = useState<HeapOp>('build');
  const [frames, setFrames] = useState<HeapFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAlgo = () => {
    const f = op === 'build' ? getBuildHeapFrames([...DEFAULT_HEAP_ARR])
      : op === 'insert' ? getInsertHeapFrames([...DEFAULT_HEAP_ARR], DEFAULT_INSERT_VAL)
      : getExtractMaxFrames([...DEFAULT_HEAP_ARR]);
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

  const heap = frame?.heap ?? [];
  const n = heap.length;

  function barColor(i: number): string {
    if (!frame) return '#374151';
    if (frame.swapping && (frame.swapping[0] === i || frame.swapping[1] === i)) return '#f59e0b';
    if (frame.i === i) return meta.accentColor;
    if (frame.j === i) return '#60a5fa';
    return '#374151';
  }

  // Build tree layout for SVG
  function treePos(i: number): { x: number; y: number } {
    const depth = Math.floor(Math.log2(i + 1));
    const posInRow = i - (Math.pow(2, depth) - 1);
    const rowCount = Math.pow(2, depth);
    const svgW = 400;
    return {
      x: (svgW / (rowCount + 1)) * (posInRow + 1),
      y: 30 + depth * 55,
    };
  }

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
          {frame?.done && <Badge variant="success">Done!</Badge>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Array visualization */}
          <div className="bg-gray-900 rounded-2xl border border-white/5 p-4">
            <p className="text-xs text-white/30 mb-3">Heap array</p>
            <div className="flex gap-1.5 flex-wrap">
              {heap.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-mono font-bold transition-all duration-150"
                    style={{ backgroundColor: `${barColor(i)}33`, borderWidth: 1, borderStyle: 'solid', borderColor: barColor(i), color: barColor(i) !== '#374151' ? 'white' : '#9ca3af' }}>
                    {val}
                  </div>
                  <span className="text-xs text-white/20">{i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tree visualization */}
          <div className="bg-gray-900 rounded-2xl border border-white/5 p-4">
            <p className="text-xs text-white/30 mb-3">Tree view</p>
            <svg viewBox="0 0 400 280" width="100%" className="max-h-[240px]">
              {/* Edges */}
              {heap.map((_, i) => {
                const l = 2 * i + 1, r = 2 * i + 2;
                const { x: px, y: py } = treePos(i);
                const edges = [];
                if (l < n) {
                  const { x: lx, y: ly } = treePos(l);
                  edges.push(<line key={`l${i}`} x1={px} y1={py} x2={lx} y2={ly} stroke="#374151" strokeWidth="1.5" />);
                }
                if (r < n) {
                  const { x: rx, y: ry } = treePos(r);
                  edges.push(<line key={`r${i}`} x1={px} y1={py} x2={rx} y2={ry} stroke="#374151" strokeWidth="1.5" />);
                }
                return edges;
              })}
              {/* Nodes */}
              {heap.map((val, i) => {
                const { x, y } = treePos(i);
                const color = barColor(i);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={16} fill={color === '#374151' ? '#374151' : `${color}33`}
                      stroke={color} strokeWidth={color !== '#374151' ? 2 : 1}
                      style={{ transition: 'all 0.15s' }} />
                    <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{val}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {frames.length > 0 && (
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, backgroundColor: meta.accentColor }} />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 mr-2">
            {OPERATIONS.map(o => (
              <Button key={o.key} size="sm" variant="ghost"
                className={op === o.key ? 'text-white bg-white/10' : 'text-white/40'}
                onClick={() => { setOp(o.key); reset(); }}>
                {o.label}
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
          {[[meta.accentColor,'Heapifying'],['#60a5fa','Child'],['#f59e0b','Swapping']].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />{label}
            </span>
          ))}
        </div>

        <CodeDisplay algoId={algorithm} activeLine={frame?.activeLine ?? 1} />
      </div>
    </div>
  );
}
