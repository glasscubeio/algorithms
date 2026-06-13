import { GRAPH_LINES } from '../../lib/codeSnippets';

export type CellBase = 'empty' | 'wall' | 'start' | 'end';

export interface TraversalFrame {
  visited: Set<number>;     // flat indices (r * cols + c)
  frontier: number[];       // current queue/stack
  current: number | null;
  path: number[] | null;
  activeLine: number;
  found: boolean;
}

const idx = (r: number, c: number, cols: number) => r * cols + c;

const DIRS_4 = [[-1,0],[1,0],[0,-1],[0,1]] as const;

function buildPath(parent: Map<number, number>, end: number): number[] {
  const path: number[] = [];
  let cur: number | undefined = end;
  while (cur !== undefined) { path.unshift(cur); cur = parent.get(cur); }
  return path;
}

export function getBFSFrames(
  grid: CellBase[][],
  rows: number, cols: number,
  startR: number, startC: number,
  endR: number, endC: number
): TraversalFrame[] {
  const frames: TraversalFrame[] = [];
  const startIdx = idx(startR, startC, cols);
  const endIdx = idx(endR, endC, cols);

  const visited = new Set<number>([startIdx]);
  const parent = new Map<number, number>();
  const queue: number[] = [startIdx];

  const snap = (current: number | null, line: number, path: number[] | null = null, found = false): TraversalFrame => ({
    visited: new Set(visited),
    frontier: [...queue],
    current,
    path,
    activeLine: line,
    found,
  });

  frames.push(snap(null, GRAPH_LINES.init));

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const r = Math.floor(curr / cols), c = curr % cols;
    frames.push(snap(curr, GRAPH_LINES.dequeue));

    if (curr === endIdx) {
      const path = buildPath(parent, endIdx);
      frames.push(snap(curr, GRAPH_LINES.checkGoal, path, true));
      return frames;
    }
    frames.push(snap(curr, GRAPH_LINES.checkGoal));

    for (const [dr, dc] of DIRS_4) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nIdx = idx(nr, nc, cols);
      if (grid[nr][nc] === 'wall') continue;

      frames.push(snap(curr, GRAPH_LINES.checkNeighbor));
      if (!visited.has(nIdx)) {
        visited.add(nIdx);
        parent.set(nIdx, curr);
        queue.push(nIdx);
        frames.push(snap(curr, GRAPH_LINES.addFrontier));
      }
    }
  }

  frames.push(snap(null, GRAPH_LINES.noPath));
  return frames;
}

export function getDFSFrames(
  grid: CellBase[][],
  rows: number, cols: number,
  startR: number, startC: number,
  endR: number, endC: number
): TraversalFrame[] {
  const frames: TraversalFrame[] = [];
  const startIdx = idx(startR, startC, cols);
  const endIdx = idx(endR, endC, cols);

  const visited = new Set<number>([startIdx]);
  const parent = new Map<number, number>();
  const stack: number[] = [startIdx];

  const snap = (current: number | null, line: number, path: number[] | null = null, found = false): TraversalFrame => ({
    visited: new Set(visited),
    frontier: [...stack],
    current,
    path,
    activeLine: line,
    found,
  });

  frames.push(snap(null, GRAPH_LINES.init));

  while (stack.length > 0) {
    const curr = stack.pop()!;
    const r = Math.floor(curr / cols), c = curr % cols;
    frames.push(snap(curr, GRAPH_LINES.dequeue));

    if (curr === endIdx) {
      const path = buildPath(parent, endIdx);
      frames.push(snap(curr, GRAPH_LINES.checkGoal, path, true));
      return frames;
    }
    frames.push(snap(curr, GRAPH_LINES.checkGoal));

    // DFS: reverse order so we explore in natural order
    for (const [dr, dc] of [...DIRS_4].reverse()) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const nIdx = idx(nr, nc, cols);
      if (grid[nr][nc] === 'wall') continue;

      frames.push(snap(curr, GRAPH_LINES.checkNeighbor));
      if (!visited.has(nIdx)) {
        visited.add(nIdx);
        parent.set(nIdx, curr);
        stack.push(nIdx);
        frames.push(snap(curr, GRAPH_LINES.addFrontier));
      }
    }
  }

  frames.push(snap(null, GRAPH_LINES.noPath));
  return frames;
}

// Simple random maze: random walls, guaranteed open corridors
export function randomMaze(rows: number, cols: number): CellBase[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) return 'wall';
      return Math.random() < 0.28 ? 'wall' : 'empty';
    }) as CellBase[]
  );
}
