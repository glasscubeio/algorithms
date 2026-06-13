import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getKruskalFrames, getPrimFrames, GRAPH_NODES, GRAPH_EDGES, MSTFrame } from './mstFrames';
import { ALGORITHMS, AlgoId } from '../../lib/algos';
import CodeDisplay from '../../components/CodeDisplay';

interface Props { algorithm: AlgoId; onBack: () => void; }

const SPEEDS = [{ label: 'Slow', ms: 600 }, { label: 'Normal', ms: 200 }, { label: 'Fast', ms: 60 }];

function edgeColor(ei: number, frame: MSTFrame | null, accentColor: string): { stroke: string; strokeWidth: number; opacity: number } {
  if (!frame) return { stroke: '#374151', strokeWidth: 2, opacity: 0.6 };
  if (frame.mstEdges.includes(ei)) return { stroke: accentColor, strokeWidth: 3, opacity: 1 };
  if (frame.rejected.includes(ei)) return { stroke: '#ef4444', strokeWidth: 2, opacity: 0.5 };
  if (frame.currentEdge === ei) return { stroke: '#fbbf24', strokeWidth: 3, opacity: 1 };
  return { stroke: '#374151', strokeWidth: 1.5, opacity: 0.4 };
}

function nodeColor(ni: number, frame: MSTFrame | null, accentColor: string): string {
  if (!frame) return '#374151';
  if (frame.visitedNodes.has(ni)) return accentColor;
  return '#374151';
}

export default function MSTVisualizer({ algorithm, onBack }: Props) {
  const meta = ALGORITHMS.find(a => a.id === algorithm)!;
  const [frames, setFrames] = useState<MSTFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runAlgo = () => {
    const f = (algorithm as string) === 'kruskal' ? getKruskalFrames() : getPrimFrames();
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
  const currentEdgeObj = frame?.currentEdge != null ? GRAPH_EDGES[frame.currentEdge] : null;
  const totalWeight = frame?.mstEdges.reduce((s, i) => s + GRAPH_EDGES[i].weight, 0) ?? 0;

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
              <span>MST edges <span className="text-green-400 font-mono">{frame.mstEdges.length}</span></span>
              <span>·</span>
              <span>Total weight <span style={{ color: meta.accentColor }} className="font-mono">{totalWeight}</span></span>
              {frame.done && <Badge variant="success">MST complete!</Badge>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* SVG Graph */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 overflow-hidden">
          <svg viewBox="0 0 550 440" width="100%" className="max-h-[420px]">
            {/* Edges */}
            {GRAPH_EDGES.map((e, ei) => {
              const from = GRAPH_NODES[e.from], to = GRAPH_NODES[e.to];
              const { stroke, strokeWidth, opacity } = edgeColor(ei, frame, meta.accentColor);
              const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
              return (
                <g key={ei}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={stroke} strokeWidth={strokeWidth} opacity={opacity}
                    strokeLinecap="round" />
                  <text x={mx} y={my - 4} textAnchor="middle" fill="#9ca3af" fontSize="11"
                    opacity={opacity}>{e.weight}</text>
                </g>
              );
            })}
            {/* Nodes */}
            {GRAPH_NODES.map((n, ni) => {
              const fill = nodeColor(ni, frame, meta.accentColor);
              const isActive = currentEdgeObj && (currentEdgeObj.from === ni || currentEdgeObj.to === ni);
              return (
                <g key={ni}>
                  <circle cx={n.x} cy={n.y} r={isActive ? 22 : 18}
                    fill={fill} stroke={isActive ? '#fbbf24' : '#6b7280'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    style={{ transition: 'all 0.2s' }} />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="600">{ni}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Current edge info */}
        {currentEdgeObj && (
          <div className="text-xs text-white/50 text-center">
            Examining edge <span className="text-yellow-400">{currentEdgeObj.from} — {currentEdgeObj.to}</span>{' '}
            (weight <span className="text-white font-mono">{currentEdgeObj.weight}</span>)
          </div>
        )}

        {frames.length > 0 && (
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, backgroundColor: meta.accentColor }} />
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => {
            if (frameIdx < 0 || isDone) { runAlgo(); setTimeout(() => setIsPlaying(true), 50); return; }
            setIsPlaying(p => !p);
          }} style={{ backgroundColor: `${meta.accentColor}22`, borderColor: `${meta.accentColor}44`, color: meta.accentColor }}>
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
          {[[meta.accentColor,'MST Edge'],['#fbbf24','Current'],['#ef4444','Rejected']].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 rounded" style={{ backgroundColor: color }} />{label}
            </span>
          ))}
        </div>

        <CodeDisplay algoId={algorithm} activeLine={frame?.activeLine ?? 1} />
      </div>
    </div>
  );
}
