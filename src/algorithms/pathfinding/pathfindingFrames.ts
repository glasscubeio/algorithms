export interface PathfindingFrame {
  visited: Set<number>;
  distances: number[]; // best known distance to each cell
  frontier: number[]; // cells currently in the priority queue
  current: number | null;
  path: number[] | null;
  activeLine: number;
  found: boolean;
}

export type GridCell = "empty" | "wall" | "start" | "end";

// Min-heap backed by a sorted array (sufficient for small visualization grids)
class MinPQ {
  private q: { p: number; i: number }[] = [];
  push(p: number, i: number) {
    this.q.push({ p, i });
  }
  pop() {
    this.q.sort((a, b) => a.p - b.p);
    return this.q.shift()!;
  }
  indices() {
    return this.q.map((x) => x.i);
  }
  isEmpty() {
    return this.q.length === 0;
  }
}

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;
const INF = 999999;

function buildPath(parent: Map<number, number>, end: number) {
  const path: number[] = [];
  let cur: number | undefined = end;
  while (cur !== undefined) {
    path.unshift(cur);
    cur = parent.get(cur);
  }
  return path;
}

// Line numbers matching codeSnippets 'dijkstra'
const DL = {
  init: 1,
  dequeue: 5,
  skipVisited: 6,
  markVisited: 7,
  checkGoal: 8,
  checkNeighbor: 11,
  relax: 12,
  noPath: 17,
};

export function getDijkstraFrames(
  weights: number[][],
  grid: GridCell[][],
  rows: number,
  cols: number,
  sR: number,
  sC: number,
  eR: number,
  eC: number,
): PathfindingFrame[] {
  const frames: PathfindingFrame[] = [];
  const dist = new Array(rows * cols).fill(INF);
  const parent = new Map<number, number>();
  const visited = new Set<number>();
  const pq = new MinPQ();
  const idx = (r: number, c: number) => r * cols + c;
  const endIdx = idx(eR, eC);

  dist[idx(sR, sC)] = 0;
  pq.push(0, idx(sR, sC));

  const snap = (
    cur: number | null,
    line: number,
    path: number[] | null = null,
    found = false,
  ): PathfindingFrame => ({
    visited: new Set(visited),
    distances: [...dist],
    frontier: pq.indices(),
    current: cur,
    path,
    activeLine: line,
    found,
  });

  frames.push(snap(null, DL.init));

  while (!pq.isEmpty()) {
    const { p: d, i: curr } = pq.pop();
    if (visited.has(curr)) {
      frames.push(snap(curr, DL.skipVisited));
      continue;
    }
    visited.add(curr);
    frames.push(snap(curr, DL.markVisited));

    if (curr === endIdx) {
      frames.push(snap(curr, DL.checkGoal, buildPath(parent, endIdx), true));
      return frames;
    }
    frames.push(snap(curr, DL.checkGoal));

    const r = Math.floor(curr / cols),
      c = curr % cols;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr,
        nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const ni = idx(nr, nc);
      if (grid[nr][nc] === "wall" || visited.has(ni)) continue;
      const nd = d + weights[nr][nc];
      frames.push(snap(curr, DL.checkNeighbor));
      if (nd < dist[ni]) {
        dist[ni] = nd;
        parent.set(ni, curr);
        pq.push(nd, ni);
        frames.push(snap(curr, DL.relax));
      }
    }
  }
  frames.push(snap(null, DL.noPath));
  return frames;
}

// Line numbers matching codeSnippets 'astar'
const AL = {
  init: 1,
  dequeue: 5,
  checkGoal: 6,
  checkNeighbor: 8,
  relax: 10,
  noPath: 16,
};

export function getAStarFrames(
  weights: number[][],
  grid: GridCell[][],
  rows: number,
  cols: number,
  sR: number,
  sC: number,
  eR: number,
  eC: number,
): PathfindingFrame[] {
  const frames: PathfindingFrame[] = [];
  const g = new Array(rows * cols).fill(INF);
  const parent = new Map<number, number>();
  const visited = new Set<number>();
  const pq = new MinPQ();
  const idx = (r: number, c: number) => r * cols + c;
  const endIdx = idx(eR, eC);
  const h = (i: number) =>
    Math.abs(Math.floor(i / cols) - eR) + Math.abs((i % cols) - eC);

  g[idx(sR, sC)] = 0;
  pq.push(h(idx(sR, sC)), idx(sR, sC));

  const snap = (
    cur: number | null,
    line: number,
    path: number[] | null = null,
    found = false,
  ): PathfindingFrame => ({
    visited: new Set(visited),
    distances: [...g],
    frontier: pq.indices(),
    current: cur,
    path,
    activeLine: line,
    found,
  });

  frames.push(snap(null, AL.init));

  while (!pq.isEmpty()) {
    const { i: curr } = pq.pop();
    if (visited.has(curr)) continue;
    visited.add(curr);
    frames.push(snap(curr, AL.dequeue));

    if (curr === endIdx) {
      frames.push(snap(curr, AL.checkGoal, buildPath(parent, endIdx), true));
      return frames;
    }
    frames.push(snap(curr, AL.checkGoal));

    const r = Math.floor(curr / cols),
      c = curr % cols;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr,
        nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const ni = idx(nr, nc);
      if (grid[nr][nc] === "wall" || visited.has(ni)) continue;
      const tg = g[curr] + weights[nr][nc];
      frames.push(snap(curr, AL.checkNeighbor));
      if (tg < g[ni]) {
        g[ni] = tg;
        parent.set(ni, curr);
        pq.push(tg + h(ni), ni);
        frames.push(snap(curr, AL.relax));
      }
    }
  }
  frames.push(snap(null, AL.noPath));
  return frames;
}

export function randomWeights(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 5) + 1),
  );
}
