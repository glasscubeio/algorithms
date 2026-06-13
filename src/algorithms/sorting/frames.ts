import { SORT_LINES } from '../../lib/codeSnippets';

export interface SortFrame {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot: number | null;
  activeLine: number;
}

function snapshot(
  a: number[],
  algo: string,
  type: 'comparing' | 'swapping' | 'sorted' | 'done' | 'pivot',
  comparing: number[] = [],
  swapping: number[] = [],
  sorted: number[] = [],
  pivot: number | null = null
): SortFrame {
  const lines = SORT_LINES[algo] ?? {};
  const activeLine = lines[type] ?? 0;
  return { array: [...a], comparing, swapping, sorted: [...sorted], pivot, activeLine };
}

export function getBubbleSortFrames(initial: number[]): SortFrame[] {
  const algo = 'bubble-sort';
  const frames: SortFrame[] = [];
  const a = [...initial];
  const sorted = new Set<number>();
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push(snapshot(a, algo, 'comparing', [j, j + 1], [], [...sorted]));
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        frames.push(snapshot(a, algo, 'swapping', [], [j, j + 1], [...sorted]));
      }
    }
    sorted.add(n - 1 - i);
  }
  sorted.add(0);
  frames.push(snapshot(a, algo, 'done', [], [], [...sorted]));
  return frames;
}

export function getSelectionSortFrames(initial: number[]): SortFrame[] {
  const algo = 'selection-sort';
  const frames: SortFrame[] = [];
  const a = [...initial];
  const sorted = new Set<number>();
  const n = a.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      frames.push(snapshot(a, algo, 'comparing', [minIdx, j], [], [...sorted]));
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      frames.push(snapshot(a, algo, 'swapping', [], [i, minIdx], [...sorted]));
    }
    sorted.add(i);
    frames.push(snapshot(a, algo, 'sorted', [], [], [...sorted]));
  }
  sorted.add(n - 1);
  frames.push(snapshot(a, algo, 'done', [], [], [...sorted]));
  return frames;
}

export function getInsertionSortFrames(initial: number[]): SortFrame[] {
  const algo = 'insertion-sort';
  const frames: SortFrame[] = [];
  const a = [...initial];
  const sorted = new Set<number>([0]);
  const n = a.length;

  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0 && a[j - 1] > a[j]) {
      frames.push(snapshot(a, algo, 'comparing', [j - 1, j], [], [...sorted]));
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      frames.push(snapshot(a, algo, 'swapping', [], [j - 1, j], [...sorted]));
      j--;
    }
    sorted.add(i);
    frames.push(snapshot(a, algo, 'sorted', [], [], [...sorted]));
  }
  return frames;
}

export function getMergeSortFrames(initial: number[]): SortFrame[] {
  const algo = 'merge-sort';
  const frames: SortFrame[] = [];
  const a = [...initial];
  const sorted = new Set<number>();

  function merge(left: number, mid: number, right: number) {
    const L = a.slice(left, mid + 1);
    const R = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < L.length && j < R.length) {
      frames.push(snapshot(a, algo, 'comparing', [left + i, mid + 1 + j], [], [...sorted]));
      a[k] = L[i] <= R[j] ? L[i++] : R[j++];
      frames.push(snapshot(a, algo, 'swapping', [], [k], [...sorted]));
      k++;
    }
    while (i < L.length) { a[k++] = L[i++]; }
    while (j < R.length) { a[k++] = R[j++]; }
    for (let x = left; x <= right; x++) sorted.add(x);
    frames.push(snapshot(a, algo, 'sorted', [], [], [...sorted]));
  }

  function sort(left: number, right: number) {
    if (left >= right) { sorted.add(left); return; }
    const mid = Math.floor((left + right) / 2);
    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  }

  sort(0, a.length - 1);
  frames.push(snapshot(a, algo, 'done', [], [], [...sorted]));
  return frames;
}

export function getQuickSortFrames(initial: number[]): SortFrame[] {
  const algo = 'quick-sort';
  const frames: SortFrame[] = [];
  const a = [...initial];
  const sorted = new Set<number>();

  function partition(low: number, high: number): number {
    frames.push(snapshot(a, algo, 'pivot', [], [], [...sorted], high));
    let i = low - 1;
    for (let j = low; j < high; j++) {
      frames.push(snapshot(a, algo, 'comparing', [j, high], [], [...sorted], high));
      if (a[j] <= a[high]) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          frames.push(snapshot(a, algo, 'swapping', [], [i, j], [...sorted], high));
        }
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    sorted.add(i + 1);
    frames.push(snapshot(a, algo, 'sorted', [], [i + 1, high], [...sorted], null));
    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low >= high) { if (low === high) sorted.add(low); return; }
    const pi = partition(low, high);
    sort(low, pi - 1);
    sort(pi + 1, high);
  }

  sort(0, a.length - 1);
  frames.push(snapshot(a, algo, 'done', [], [], [...sorted]));
  return frames;
}

export function getFrames(algoId: string): (arr: number[]) => SortFrame[] {
  switch (algoId) {
    case 'bubble-sort': return getBubbleSortFrames;
    case 'selection-sort': return getSelectionSortFrames;
    case 'insertion-sort': return getInsertionSortFrames;
    case 'merge-sort': return getMergeSortFrames;
    case 'quick-sort': return getQuickSortFrames;
    default: return getBubbleSortFrames;
  }
}
