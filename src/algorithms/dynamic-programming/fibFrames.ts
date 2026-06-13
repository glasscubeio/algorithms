export interface FibFrame {
  table: (number | null)[];
  current: number | null;  // index being computed
  reading: number[];       // indices being read (i-1, i-2)
  activeLine: number;
  n: number;
}

// Line mapping matching codeSnippets 'fibonacci-dp'
const L = { init:1, base0:2, base1:3, loop:4, compute:5, done:7 };

export function getFibFrames(n: number): FibFrame[] {
  const frames: FibFrame[] = [];
  const table: (number | null)[] = new Array(n + 1).fill(null);

  const snap = (cur: number | null, reading: number[], line: number): FibFrame => ({
    table: [...table], current: cur, reading, activeLine: line, n,
  });

  frames.push(snap(null, [], L.init));

  table[0] = 0;
  frames.push(snap(0, [], L.base0));
  if (n === 0) { frames.push(snap(0, [], L.done)); return frames; }

  table[1] = 1;
  frames.push(snap(1, [], L.base1));
  if (n === 1) { frames.push(snap(1, [], L.done)); return frames; }

  for (let i = 2; i <= n; i++) {
    frames.push(snap(i, [], L.loop));
    frames.push(snap(i, [i - 1, i - 2], L.compute));
    table[i] = table[i - 1]! + table[i - 2]!;
    frames.push(snap(i, [i - 1, i - 2], L.compute));
  }

  frames.push(snap(n, [], L.done));
  return frames;
}
