export interface KSItem { weight: number; value: number; label: string; }

export interface KnapsackFrame {
  table: number[][];           // dp[item][capacity]
  currentCell: [number, number] | null;
  takingItem: boolean;         // is the current cell taking the item?
  activeLine: number;
  items: KSItem[];
  capacity: number;
}

export const DEFAULT_ITEMS: KSItem[] = [
  { weight: 2, value: 6,  label: '💎' },
  { weight: 2, value: 10, label: '📱' },
  { weight: 3, value: 12, label: '🎧' },
  { weight: 5, value: 15, label: '💻' },
  { weight: 4, value: 8,  label: '📷' },
];
export const DEFAULT_CAPACITY = 9;

// Line mapping matching codeSnippets 'knapsack-dp'
const L = { init:2, outerLoop:3, innerLoop:5, notTake:6, check:7, take:8, done:11 };

export function getKnapsackFrames(items: KSItem[] = DEFAULT_ITEMS, W: number = DEFAULT_CAPACITY): KnapsackFrame[] {
  const frames: KnapsackFrame[] = [];
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  const snap = (cell: [number, number] | null, taking: boolean, line: number): KnapsackFrame => ({
    table: dp.map(row => [...row]),
    currentCell: cell,
    takingItem: taking,
    activeLine: line,
    items,
    capacity: W,
  });

  frames.push(snap(null, false, L.init));

  for (let i = 1; i <= n; i++) {
    frames.push(snap(null, false, L.outerLoop));
    const { weight: w, value: v } = items[i - 1];
    for (let cap = 0; cap <= W; cap++) {
      frames.push(snap([i, cap], false, L.innerLoop));
      dp[i][cap] = dp[i - 1][cap];
      frames.push(snap([i, cap], false, L.notTake));
      if (w <= cap) {
        frames.push(snap([i, cap], false, L.check));
        const withItem = v + dp[i - 1][cap - w];
        if (withItem > dp[i][cap]) {
          dp[i][cap] = withItem;
          frames.push(snap([i, cap], true, L.take));
        }
      }
    }
  }

  frames.push(snap(null, false, L.done));
  return frames;
}
