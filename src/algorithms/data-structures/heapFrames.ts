export type HeapOp = 'build' | 'insert' | 'extract';

export interface HeapFrame {
  heap: number[];
  i: number | null;        // current index being heapified
  j: number | null;        // child/parent being compared
  swapping: [number, number] | null;
  op: HeapOp;
  done: boolean;
  activeLine: number;
}

// Line mapping matching codeSnippets 'heap'
const HL = { start:1, compare:3, swap:4, recurse:5, done:6 };
const IL = { push:9, siftUp:10, compare:11, swap:12, done:13 };
const EL = { swap:16, pop:17, heapify:18, done:19 };

const snap = (heap: number[], i: number | null, j: number | null, sw: [number, number] | null, op: HeapOp, done: boolean, line: number): HeapFrame => ({
  heap: [...heap], i, j, swapping: sw, op, done, activeLine: line,
});

export function getBuildHeapFrames(arr: number[]): HeapFrame[] {
  const frames: HeapFrame[] = [];
  const heap = [...arr];
  const n = heap.length;

  function heapify(idx: number) {
    frames.push(snap(heap, idx, null, null, 'build', false, HL.start));
    let largest = idx;
    const l = 2 * idx + 1, r = 2 * idx + 2;
    frames.push(snap(heap, idx, l < n ? l : null, null, 'build', false, HL.compare));
    if (l < n && heap[l] > heap[largest]) largest = l;
    if (r < n && heap[r] > heap[largest]) largest = r;
    if (largest !== idx) {
      frames.push(snap(heap, idx, largest, [idx, largest], 'build', false, HL.swap));
      [heap[idx], heap[largest]] = [heap[largest], heap[idx]];
      frames.push(snap(heap, idx, largest, null, 'build', false, HL.recurse));
      heapify(largest);
    } else {
      frames.push(snap(heap, idx, null, null, 'build', false, HL.done));
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(i);
  frames.push(snap(heap, null, null, null, 'build', true, HL.done));
  return frames;
}

export function getInsertHeapFrames(arr: number[], val: number): HeapFrame[] {
  const frames: HeapFrame[] = [];
  const heap = [...arr];

  // First build the heap
  const n = heap.length;
  function heapify(idx: number) {
    let largest = idx;
    const l = 2 * idx + 1, r = 2 * idx + 2;
    if (l < n && heap[l] > heap[largest]) largest = l;
    if (r < n && heap[r] > heap[largest]) largest = r;
    if (largest !== idx) { [heap[idx], heap[largest]] = [heap[largest], heap[idx]]; heapify(largest); }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(i);

  // Insert
  heap.push(val);
  frames.push(snap(heap, heap.length - 1, null, null, 'insert', false, IL.push));

  let i = heap.length - 1;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    frames.push(snap(heap, i, parent, null, 'insert', false, IL.compare));
    if (heap[i] > heap[parent]) {
      frames.push(snap(heap, i, parent, [i, parent], 'insert', false, IL.swap));
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    } else {
      break;
    }
  }
  frames.push(snap(heap, null, null, null, 'insert', true, IL.done));
  return frames;
}

export function getExtractMaxFrames(arr: number[]): HeapFrame[] {
  const frames: HeapFrame[] = [];
  const heap = [...arr];

  // Build
  const n0 = heap.length;
  function heapify0(idx: number) {
    let largest = idx;
    const l = 2 * idx + 1, r = 2 * idx + 2;
    if (l < n0 && heap[l] > heap[largest]) largest = l;
    if (r < n0 && heap[r] > heap[largest]) largest = r;
    if (largest !== idx) { [heap[idx], heap[largest]] = [heap[largest], heap[idx]]; heapify0(largest); }
  }
  for (let i = Math.floor(n0 / 2) - 1; i >= 0; i--) heapify0(i);

  // Swap root with last
  frames.push(snap(heap, 0, heap.length - 1, [0, heap.length - 1], 'extract', false, EL.swap));
  [heap[0], heap[heap.length - 1]] = [heap[heap.length - 1], heap[0]];
  heap.pop();
  frames.push(snap(heap, null, null, null, 'extract', false, EL.pop));

  // Heapify
  const m = heap.length;
  function heapify(idx: number) {
    frames.push(snap(heap, idx, null, null, 'extract', false, EL.heapify));
    let largest = idx;
    const l = 2 * idx + 1, r = 2 * idx + 2;
    if (l < m && heap[l] > heap[largest]) largest = l;
    if (r < m && heap[r] > heap[largest]) largest = r;
    if (largest !== idx) {
      frames.push(snap(heap, idx, largest, [idx, largest], 'extract', false, EL.heapify));
      [heap[idx], heap[largest]] = [heap[largest], heap[idx]];
      heapify(largest);
    }
  }
  heapify(0);
  frames.push(snap(heap, null, null, null, 'extract', true, EL.done));
  return frames;
}

export const DEFAULT_HEAP_ARR = [3, 9, 2, 1, 4, 5, 7, 8, 6];
export const DEFAULT_INSERT_VAL = 10;
