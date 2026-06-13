export interface NQueensFrame {
  board: (0 | 1 | 2)[][];  // 0=empty, 1=queen, 2=attacked (current try)
  row: number;
  col: number | null;
  backtracking: boolean;
  solved: boolean;
  activeLine: number;
}

// Line mapping matching codeSnippets 'n-queens'
const L = { solve:1, baseCase:2, tryCol:4, isValid:5, place:6, recurse:7, backtrack:8, noSol:9 };

function isSafe(board: number[][], row: number, col: number, n: number): boolean {
  for (let i = 0; i < row; i++) if (board[i][col] === 1) return false;
  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 1) return false;
  for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) if (board[i][j] === 1) return false;
  return true;
}

export function getNQueensFrames(n: number): NQueensFrame[] {
  const frames: NQueensFrame[] = [];
  const board: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  const snap = (row: number, col: number | null, backtracking: boolean, solved: boolean, line: number): NQueensFrame => ({
    board: board.map(r => [...r]) as (0 | 1 | 2)[][],
    row, col, backtracking, solved, activeLine: line,
  });

  function solve(row: number): boolean {
    frames.push(snap(row, null, false, false, L.solve));
    if (row === n) {
      frames.push(snap(row, null, false, true, L.baseCase));
      return true;
    }
    for (let col = 0; col < n; col++) {
      frames.push(snap(row, col, false, false, L.tryCol));
      frames.push(snap(row, col, false, false, L.isValid));
      if (isSafe(board, row, col, n)) {
        board[row][col] = 1;
        frames.push(snap(row, col, false, false, L.place));
        frames.push(snap(row, col, false, false, L.recurse));
        if (solve(row + 1)) return true;
        board[row][col] = 0;
        frames.push(snap(row, col, true, false, L.backtrack));
      }
    }
    frames.push(snap(row, null, true, false, L.noSol));
    return false;
  }

  solve(0);
  return frames;
}
