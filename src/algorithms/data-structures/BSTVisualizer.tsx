import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getBSTFrames, BSTFrame, DEFAULT_VALUES, DEFAULT_SEARCH } from './bstFrames';
import { ALGORITHMS, AlgoId } from '../../lib/algos';
import CodeDisplay from '../../components/CodeDisplay';

interface Props { algorithm: AlgoId; onBack: () => void; }
const SPEEDS = [{ label: 'Slow', ms: 600 }, { label: 'Normal', ms: 200 }, { label: 'Fast', ms: 60 }];

export default function BSTVisualizer({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find(a => a.id === algorithm)!;
  const [frames, setFrames] = useState<BSTFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAlgo = () => {
    const f = getBSTFrames(DEFAULT_VALUES, DEFAULT_SEARCH);
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

  function nodeColor(ni: number): { fill: string; stroke: string } {
    if (!frame) return { fill: '#374151', stroke: '#6b7280' };
    if (frame.highlightIdx === ni) return { fill: '#10b981', stroke: '#6ee7b7' };
    if (frame.currentIdx === ni) return { fill: meta.accentColor, stroke: meta.accentColor };
    if (frame.comparing === ni) return { fill: '#f59e0b', stroke: '#fbbf24' };
    if (frame.path.includes(ni)) return { fill: '#1d4ed8', stroke: '#60a5fa' };
    return { fill: '#374151', stroke: '#6b7280' };
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
          {frame && (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Badge variant="outline">{frame.operation === 'insert' ? 'Inserting' : `Searching ${DEFAULT_SEARCH}`}</Badge>
              {frame.done && frame.operation === 'search' && (
                frame.highlightIdx !== null
                  ? <Badge variant="success">Found {DEFAULT_SEARCH}!</Badge>
                  : <Badge variant="outline" className="border-red-500/50 text-red-400">Not found</Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <div className="bg-gray-900 rounded-2xl border border-white/5 overflow-hidden">
          <svg viewBox="0 0 540 330" width="100%" className="max-h-[330px]">
            {/* Edges */}
            {frame?.nodes.map((node, ni) => {
              const edges = [];
              if (node.left !== null) {
                const child = frame.nodes[node.left];
                edges.push(<line key={`l${ni}`} x1={node.x} y1={node.y} x2={child.x} y2={child.y} stroke="#374151" strokeWidth="1.5" />);
              }
              if (node.right !== null) {
                const child = frame.nodes[node.right];
                edges.push(<line key={`r${ni}`} x1={node.x} y1={node.y} x2={child.x} y2={child.y} stroke="#374151" strokeWidth="1.5" />);
              }
              return edges;
            })}
            {/* Nodes */}
            {frame?.nodes.map((node, ni) => {
              const { fill, stroke } = nodeColor(ni);
              return (
                <g key={ni}>
                  <circle cx={node.x} cy={node.y} r={18} fill={fill} stroke={stroke} strokeWidth="2"
                    style={{ transition: 'fill 0.2s, stroke 0.2s' }} />
                  <text x={node.x} y={node.y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{node.val}</text>
                </g>
              );
            })}
          </svg>
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

        <div className="flex flex-wrap gap-4 text-xs text-white/50">
          {[[meta.accentColor,'Current/Inserted'],['#f59e0b','Comparing'],['#1d4ed8','Path'],['#10b981','Found']].map(([color, label]) => (
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
