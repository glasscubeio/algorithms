export interface BSTNode {
  val: number;
  left: number | null;   // index into nodes array
  right: number | null;
  x: number; y: number;
  depth: number;
}

export interface BSTFrame {
  nodes: BSTNode[];
  currentIdx: number | null;
  highlightIdx: number | null;  // found node
  comparing: number | null;
  path: number[];
  operation: 'insert' | 'search';
  done: boolean;
  activeLine: number;
}

// Line mapping matching codeSnippets 'bst'
const IL = { isEmpty:1, compare:2, goLeft:3, goRight:4, insert:5 };
const SL = { isEmpty:8, compare:9, found:10, goLeft:11, goRight:12, notFound:13 };

const W = 540;

function layoutNodes(nodes: BSTNode[], root: number | null): void {
  if (root === null) return;

  function assign(idx: number | null, depth: number, left: number, right: number): void {
    if (idx === null) return;
    const n = nodes[idx];
    n.x = (left + right) / 2;
    n.y = 40 + depth * 60;
    n.depth = depth;
    assign(n.left, depth + 1, left, (left + right) / 2);
    assign(n.right, depth + 1, (left + right) / 2, right);
  }
  assign(root, 0, 0, W);
}

export function getBSTFrames(values: number[], searchVal?: number): BSTFrame[] {
  const frames: BSTFrame[] = [];
  const nodes: BSTNode[] = [];
  let root: number | null = null;
  const path: number[] = [];

  const snap = (cur: number | null, hi: number | null, comp: number | null, op: 'insert' | 'search', done: boolean, line: number): BSTFrame => ({
    nodes: nodes.map(n => ({ ...n })), currentIdx: cur, highlightIdx: hi,
    comparing: comp, path: [...path], operation: op, done, activeLine: line,
  });

  function insert(val: number) {
    const ni = nodes.length;
    nodes.push({ val, left: null, right: null, x: 0, y: 0, depth: 0 });
    if (root === null) {
      root = ni;
      frames.push(snap(ni, null, null, 'insert', false, IL.isEmpty));
      layoutNodes(nodes, root);
      frames.push(snap(ni, ni, null, 'insert', true, IL.insert));
      return;
    }
    let cur: number = root;
    while (true) {
      frames.push(snap(cur, null, cur, 'insert', false, IL.compare));
      if (val < nodes[cur].val) {
        frames.push(snap(cur, null, cur, 'insert', false, IL.goLeft));
        if (nodes[cur].left === null) {
          nodes[cur].left = ni;
          layoutNodes(nodes, root);
          frames.push(snap(ni, ni, null, 'insert', true, IL.insert));
          break;
        }
        cur = nodes[cur].left!;
      } else {
        frames.push(snap(cur, null, cur, 'insert', false, IL.goRight));
        if (nodes[cur].right === null) {
          nodes[cur].right = ni;
          layoutNodes(nodes, root);
          frames.push(snap(ni, ni, null, 'insert', true, IL.insert));
          break;
        }
        cur = nodes[cur].right!;
      }
    }
  }

  function search(val: number) {
    if (root === null) { frames.push(snap(null, null, null, 'search', true, SL.isEmpty)); return; }
    let cur: number | null = root;
    while (cur !== null) {
      path.push(cur);
      frames.push(snap(cur, null, cur, 'search', false, SL.compare));
      if (val === nodes[cur].val) {
        frames.push(snap(cur, cur, null, 'search', true, SL.found));
        return;
      } else if (val < nodes[cur].val) {
        frames.push(snap(cur, null, cur, 'search', false, SL.goLeft));
        cur = nodes[cur].left;
      } else {
        frames.push(snap(cur, null, cur, 'search', false, SL.goRight));
        cur = nodes[cur].right;
      }
    }
    frames.push(snap(null, null, null, 'search', true, SL.notFound));
  }

  for (const v of values) insert(v);
  if (searchVal !== undefined) {
    path.length = 0;
    search(searchVal);
  }
  return frames;
}

export const DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80, 10, 35, 55, 75];
export const DEFAULT_SEARCH = 40;
