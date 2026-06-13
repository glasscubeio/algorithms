# Glasscube Algorithm Visualizer

An interactive algorithm visualizer SPA built with React 19, Vite, TypeScript, Tailwind CSS v4, and Framer Motion. Step through 19 algorithms with smooth frame-by-frame animations, synchronized code highlighting in TypeScript, Rust, and Java, and interactive controls.

## ⚡ Quick Start

```bash
git clone https://github.com/glasscubeio/algorithms.git
cd algorithms
bun install
bun run dev
```

## 🗂 Project Structure

```
src/
  App.tsx                                   # SPA root — active algo state, AnimatePresence
  main.tsx                                  # Entry point (no router)
  lib/
    algos.ts                                # AlgoId union, Category types, ALGORITHMS registry
    codeSnippets.ts                         # TS / Rust / Java code arrays per algorithm
    utils.ts                                # cn() class helper
  components/
    CodeDisplay.tsx                         # Syntax-highlighted code with active-line tracking
    ui/
      button.tsx                            # Variant button (default/ghost/outline/danger)
      badge.tsx                             # Variant badge (default/outline/success)
  algorithms/
    cellular-automata/
      ConwaySquare.tsx                      # Conway — square grid, 8-neighbor
      ConwayHex.tsx                         # Conway — hex-shaped SVG grid, axial coords
    sorting/
      frames.ts                             # SortFrame generators (5 algorithms)
      SortingVisualizer.tsx                 # Shared bar-chart animation
    graph/
      traversalFrames.ts                    # BFS / DFS frame generators
      GraphTraversal.tsx                    # Interactive grid visualizer
      mstFrames.ts                          # Kruskal / Prim frame generators
      MSTVisualizer.tsx                     # SVG graph MST visualizer
    pathfinding/
      pathfindingFrames.ts                  # Dijkstra / A* frame generators
      PathfindingVisualizer.tsx             # Weighted grid pathfinding visualizer
    dynamic-programming/
      fibFrames.ts                          # Fibonacci DP frame generator
      FibonacciDP.tsx                       # 1D memoization table visualizer
      knapsackFrames.ts                     # 0/1 Knapsack frame generator
      KnapsackDP.tsx                        # 2D DP table + items sidebar
    backtracking/
      nqueensFrames.ts                      # N-Queens backtracking frame generator
      NQueens.tsx                           # Chessboard with backtrack animation
    strings/
      kmpFrames.ts                          # KMP failure table + search frames
      KMPVisualizer.tsx                     # Text/pattern/failure-table display
    data-structures/
      bstFrames.ts                          # BST insert + search frame generator
      BSTVisualizer.tsx                     # SVG tree diagram
      heapFrames.ts                         # Max-heap build/insert/extract frames
      HeapVisualizer.tsx                    # Array + tree dual view
  views/
    Landing.tsx                             # Algorithm cards grouped by category
```

## 🎬 Algorithms (19 total)

### Cellular Automata

| Algorithm | Grid | Neighbors | Notes |
|-----------|------|-----------|-------|
| Conway's Game of Life | Square | 8 (Moore) | Gap cells, large map, drag-draw |
| Conway's Game of Life | Hexagonal SVG | 6 (axial) | Proper hex-shaped map, glow filter |

The hexagonal grid uses **axial coordinates** — valid cells satisfy `max(|q|, |r|, |q+r|) ≤ N` — producing 271 cells in a regular hexagon shape.

### Sorting

| Algorithm | Time | Space | Stable |
|-----------|------|-------|--------|
| Bubble Sort | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(1) | No |
| Insertion Sort | O(n²) | O(1) | Yes |
| Merge Sort | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) avg | O(log n) | No |

Bar colors: Yellow = comparing · Red = swapping · Orange = pivot · Green = sorted

### Graph Traversal

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| BFS | O(V + E) | O(V) | Queue; shortest path in unweighted graph |
| DFS | O(V + E) | O(V) | Stack; explores deep before wide |

Interactive grid with wall/start/end drawing, maze generator, step controls.

### Pathfinding (weighted grid)

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| Dijkstra | O((V+E) log V) | O(V) | Optimal weighted shortest path |
| A* | O(E log V) | O(V) | Manhattan heuristic; faster than Dijkstra toward goal |

Cells show edge weights (1–5). Visited cells show current best distance.

### Minimum Spanning Tree (SVG graph, 10 nodes, 16 edges)

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| Kruskal | O(E log E) | O(V) | Sort edges + Union-Find cycle detection |
| Prim | O(E log V) | O(V) | Grow tree greedily from node 0 |

### Dynamic Programming

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| Fibonacci DP | O(n) | O(n) | 1D memoization table, selectable n |
| 0/1 Knapsack | O(n·W) | O(n·W) | 2D table + items sidebar |

### Backtracking

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| N-Queens | O(n!) | O(n) | Selectable N (4–8), pruning visible |

### Strings

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| KMP | O(n + m) | O(m) | Failure table build phase then search phase |

### Data Structures

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| Binary Search Tree | O(log n) avg | O(n) | Insert 11 nodes then search |
| Max-Heap | O(log n) | O(1) | Build-heap, insert, extract-max; dual array+tree view |

## 🖥 UI Features

- **SPA** — no React Router; single `active: AlgoId | null` state in `App.tsx`
- **Animated transitions** — Framer Motion `AnimatePresence` between views
- **Code panel** — TypeScript / Rust / Java tabs, active line highlighted in yellow, auto-scrolls
- **Speed presets** — Slow / Normal / Fast on every visualizer
- **Step controls** — ← → buttons for frame-by-frame stepping
- **Interactive grids** — drag-draw walls, randomize maze/weights

## 🛠 Tech Stack

| Tool | Version | Role |
|------|---------|------|
| React | 19 | UI |
| TypeScript | 5 | Type safety (strict mode) |
| Vite + SWC | 6 | Build & HMR |
| Tailwind CSS | 4 | Styling |
| Framer Motion | 12 | Animations |
| Lucide React | latest | Icons |
| Bun | latest | Package manager & runner |

## License

MIT
