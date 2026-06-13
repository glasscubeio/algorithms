export interface MSTNode { x: number; y: number; }
export interface MSTEdge { from: number; to: number; weight: number; }

export interface MSTFrame {
  mstEdges: number[];      // edge indices in MST
  rejected: number[];      // edge indices rejected (cycle / already visited)
  currentEdge: number | null;
  visitedNodes: Set<number>;
  components: number[][];  // Kruskal: union-find groups
  activeLine: number;
  done: boolean;
}

// Fixed 10-node graph
export const GRAPH_NODES: MSTNode[] = [
  { x: 250, y: 55 },
  { x: 100, y: 145 },
  { x: 400, y: 145 },
  { x: 55,  y: 260 },
  { x: 210, y: 260 },
  { x: 370, y: 260 },
  { x: 490, y: 260 },
  { x: 135, y: 380 },
  { x: 305, y: 380 },
  { x: 455, y: 380 },
];

export const GRAPH_EDGES: MSTEdge[] = [
  { from: 0, to: 1, weight: 4 },
  { from: 0, to: 2, weight: 3 },
  { from: 1, to: 3, weight: 2 },
  { from: 1, to: 4, weight: 6 },
  { from: 2, to: 4, weight: 5 },
  { from: 2, to: 5, weight: 1 },
  { from: 2, to: 6, weight: 8 },
  { from: 3, to: 7, weight: 3 },
  { from: 4, to: 7, weight: 5 },
  { from: 4, to: 8, weight: 4 },
  { from: 5, to: 8, weight: 2 },
  { from: 5, to: 9, weight: 7 },
  { from: 6, to: 9, weight: 4 },
  { from: 7, to: 8, weight: 6 },
  { from: 8, to: 9, weight: 3 },
  { from: 3, to: 4, weight: 9 },
];

// Union-Find with path compression
class UF {
  private p: number[];
  constructor(n: number) { this.p = Array.from({ length: n }, (_, i) => i); }
  find(x: number): number { return this.p[x] === x ? x : (this.p[x] = this.find(this.p[x])); }
  union(x: number, y: number) { this.p[this.find(x)] = this.find(y); }
  connected(x: number, y: number) { return this.find(x) === this.find(y); }
  groups(): number[][] {
    const m = new Map<number, number[]>();
    for (let i = 0; i < this.p.length; i++) {
      const root = this.find(i);
      if (!m.has(root)) m.set(root, []);
      m.get(root)!.push(i);
    }
    return [...m.values()];
  }
}

// Kruskal lines
const KL = { sort:1, checkEdge:4, checkCycle:5, union:6, addMST:7, done:9 };

export function getKruskalFrames(): MSTFrame[] {
  const frames: MSTFrame[] = [];
  const n = GRAPH_NODES.length;
  const sortedIdx = GRAPH_EDGES
    .map((_, i) => i)
    .sort((a, b) => GRAPH_EDGES[a].weight - GRAPH_EDGES[b].weight);
  const uf = new UF(n);
  const mstEdges: number[] = [];
  const rejected: number[] = [];

  const snap = (cur: number | null, line: number): MSTFrame => ({
    mstEdges: [...mstEdges],
    rejected: [...rejected],
    currentEdge: cur,
    visitedNodes: new Set(mstEdges.flatMap(i => [GRAPH_EDGES[i].from, GRAPH_EDGES[i].to])),
    components: uf.groups(),
    activeLine: line,
    done: mstEdges.length === n - 1,
  });

  frames.push(snap(null, KL.sort));

  for (const ei of sortedIdx) {
    if (mstEdges.length === n - 1) break;
    const { from: u, to: v } = GRAPH_EDGES[ei];
    frames.push(snap(ei, KL.checkEdge));
    frames.push(snap(ei, KL.checkCycle));
    if (!uf.connected(u, v)) {
      uf.union(u, v);
      mstEdges.push(ei);
      frames.push(snap(ei, KL.union));
      frames.push(snap(ei, KL.addMST));
    } else {
      rejected.push(ei);
      frames.push(snap(ei, KL.done));
    }
  }

  frames.push(snap(null, KL.done));
  return frames;
}

// Prim lines
const PL = { init:1, addEdges:2, extractMin:5, skipVisited:6, addMST:7, addFrontier:9, done:12 };

export function getPrimFrames(): MSTFrame[] {
  const frames: MSTFrame[] = [];
  const n = GRAPH_NODES.length;
  // Build adjacency list
  const adj: { to: number; ei: number; w: number }[][] = Array.from({ length: n }, () => []);
  GRAPH_EDGES.forEach(({ from, to, weight }, i) => {
    adj[from].push({ to, ei: i, w: weight });
    adj[to].push({ to: from, ei: i, w: weight });
  });

  const inMST = new Set<number>([0]);
  const mstEdges: number[] = [];
  const rejected: number[] = [];
  // pq: [weight, edge_idx, to_node]
  const pq: { w: number; ei: number; to: number }[] = adj[0].map(e => ({ w: e.w, ei: e.ei, to: e.to }));

  const snap = (curE: number | null, line: number): MSTFrame => ({
    mstEdges: [...mstEdges],
    rejected: [...rejected],
    currentEdge: curE,
    visitedNodes: new Set(inMST),
    components: [],
    activeLine: line,
    done: inMST.size === n,
  });

  frames.push(snap(null, PL.init));
  frames.push(snap(null, PL.addEdges));

  while (pq.length > 0 && inMST.size < n) {
    pq.sort((a, b) => a.w - b.w);
    const { ei, to } = pq.shift()!;
    frames.push(snap(ei, PL.extractMin));

    if (inMST.has(to)) {
      rejected.push(ei);
      frames.push(snap(ei, PL.skipVisited));
      continue;
    }
    inMST.add(to);
    mstEdges.push(ei);
    frames.push(snap(ei, PL.addMST));

    for (const e of adj[to]) {
      if (!inMST.has(e.to)) {
        pq.push({ w: e.w, ei: e.ei, to: e.to });
        frames.push(snap(ei, PL.addFrontier));
      }
    }
  }

  frames.push(snap(null, PL.done));
  return frames;
}
