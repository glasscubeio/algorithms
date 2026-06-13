export type AlgoId =
  | "conway-hex"
  | "conway-square"
  | "bubble-sort"
  | "selection-sort"
  | "insertion-sort"
  | "merge-sort"
  | "quick-sort"
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "astar"
  | "kruskal"
  | "prim"
  | "fibonacci-dp"
  | "knapsack-dp"
  | "n-queens"
  | "kmp"
  | "bst"
  | "heap";

export type Category =
  | "Cellular Automata"
  | "Sorting"
  | "Graph Traversal"
  | "Pathfinding"
  | "Minimum Spanning Tree"
  | "Dynamic Programming"
  | "Backtracking"
  | "Strings"
  | "Data Structures";

export interface AlgoMeta {
  id: AlgoId;
  name: string;
  subtitle: string | null;
  description: string;
  category: Category;
  timeComplexity: string;
  spaceComplexity: string;
  note: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  accentColor: string;
}

export const ALGORITHMS: AlgoMeta[] = [
  {
    id: "conway-hex",
    name: "Conway's Game of Life",
    subtitle: "Hexagonal Grid",
    description:
      "Cellular automaton on a proper hexagonal-shaped map using axial coordinates and 6-neighbor topology. Each cell evolves based on its six immediate neighbors.",
    category: "Cellular Automata",
    timeComplexity: "O(n·g)",
    spaceComplexity: "O(n)",
    note: "n = cells · g = generations",
    gradient: "from-purple-500 to-violet-600",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    accentColor: "#a855f7",
  },
  {
    id: "conway-square",
    name: "Conway's Game of Life",
    subtitle: "Square Grid",
    description:
      "The classic 8-neighbor cellular automaton on a square grid. Supports well-known emergent patterns: gliders, blinkers, spaceships, and still lifes.",
    category: "Cellular Automata",
    timeComplexity: "O(n·g)",
    spaceComplexity: "O(n)",
    note: "n = cells · g = generations",
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    accentColor: "#3b82f6",
  },
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    subtitle: null,
    description:
      "Repeatedly steps through the list, compares adjacent elements and swaps if in wrong order. Simple to understand, poor real-world performance.",
    category: "Sorting",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    note: "Stable · In-place",
    gradient: "from-cyan-500 to-teal-500",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    accentColor: "#06b6d4",
  },
  {
    id: "selection-sort",
    name: "Selection Sort",
    subtitle: null,
    description:
      "Divides into sorted and unsorted regions, repeatedly selecting the minimum element from the unsorted region and placing it at the front.",
    category: "Sorting",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    note: "Unstable · In-place",
    gradient: "from-blue-500 to-indigo-500",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    accentColor: "#6366f1",
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    subtitle: null,
    description:
      "Builds a sorted array one item at a time by inserting each element into its correct position. Very efficient for small or nearly-sorted arrays.",
    category: "Sorting",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    note: "Stable · In-place",
    gradient: "from-indigo-500 to-purple-500",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
    accentColor: "#8b5cf6",
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    subtitle: null,
    description:
      "Divide-and-conquer: recursively splits arrays in half, sorts each, then merges. Guaranteed O(n log n) in all cases.",
    category: "Sorting",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    note: "Stable · Not in-place",
    gradient: "from-pink-500 to-rose-500",
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
    accentColor: "#ec4899",
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    subtitle: null,
    description:
      "Selects a pivot, partitions around it, then recursively sorts. Fastest in practice for most real-world inputs despite O(n²) worst case.",
    category: "Sorting",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(log n)",
    note: "Unstable · In-place",
    gradient: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    accentColor: "#f97316",
  },
  {
    id: "bfs",
    name: "Breadth-First Search",
    subtitle: null,
    description:
      "Explores the graph level by level using a queue. Guarantees the shortest path in an unweighted graph. Visits all nodes at distance d before d+1.",
    category: "Graph Traversal",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    note: "Shortest path · Queue",
    gradient: "from-teal-500 to-emerald-500",
    iconBg: "bg-teal-500/20",
    iconColor: "text-teal-400",
    accentColor: "#14b8a6",
  },
  {
    id: "dfs",
    name: "Depth-First Search",
    subtitle: null,
    description:
      "Explores as far as possible along each branch before backtracking. Uses a stack (implicit in recursion). Does not guarantee shortest path.",
    category: "Graph Traversal",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    note: "Explores deep · Stack",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    accentColor: "#7c3aed",
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    subtitle: null,
    description:
      "Finds shortest paths from a source in a weighted graph by greedily expanding the minimum-distance frontier. Real-world GPS routing uses a variant of this.",
    category: "Pathfinding",
    timeComplexity: "O((V+E) log V)",
    spaceComplexity: "O(V)",
    note: "Weighted · Priority queue",
    gradient: "from-sky-500 to-blue-600",
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-400",
    accentColor: "#0ea5e9",
  },
  {
    id: "astar",
    name: "A* Search",
    subtitle: null,
    description:
      "Heuristic-guided pathfinding that combines Dijkstra's optimality with directional awareness. Uses f = g + h to focus exploration toward the goal.",
    category: "Pathfinding",
    timeComplexity: "O(E log V)",
    spaceComplexity: "O(V)",
    note: "Heuristic · Optimal",
    gradient: "from-emerald-500 to-green-600",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    accentColor: "#10b981",
  },
  {
    id: "kruskal",
    name: "Kruskal's MST",
    subtitle: null,
    description:
      "Builds a minimum spanning tree by sorting all edges and greedily adding the cheapest edge that doesn't form a cycle, using Union-Find for cycle detection.",
    category: "Minimum Spanning Tree",
    timeComplexity: "O(E log E)",
    spaceComplexity: "O(V)",
    note: "Edge-based · Union-Find",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    accentColor: "#f59e0b",
  },
  {
    id: "prim",
    name: "Prim's MST",
    subtitle: null,
    description:
      "Grows a minimum spanning tree one vertex at a time by always picking the cheapest edge connecting the growing tree to an unvisited vertex.",
    category: "Minimum Spanning Tree",
    timeComplexity: "O(E log V)",
    spaceComplexity: "O(V)",
    note: "Vertex-based · Greedy",
    gradient: "from-lime-500 to-green-600",
    iconBg: "bg-lime-500/20",
    iconColor: "text-lime-400",
    accentColor: "#84cc16",
  },
  {
    id: "fibonacci-dp",
    name: "Fibonacci DP",
    subtitle: "Memoization",
    description:
      "Computes Fibonacci numbers using bottom-up dynamic programming with a 1D table. Watch each cell fill in as dependencies are resolved left to right.",
    category: "Dynamic Programming",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    note: "Bottom-up · Tabulation",
    gradient: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
    accentColor: "#f43f5e",
  },
  {
    id: "knapsack-dp",
    name: "0/1 Knapsack",
    subtitle: "Dynamic Programming",
    description:
      "Given items with weights and values, maximize value within a capacity constraint. Solved with a 2D DP table showing optimal value for every sub-problem.",
    category: "Dynamic Programming",
    timeComplexity: "O(n·W)",
    spaceComplexity: "O(n·W)",
    note: "Classic DP · NP-complete",
    gradient: "from-fuchsia-500 to-purple-600",
    iconBg: "bg-fuchsia-500/20",
    iconColor: "text-fuchsia-400",
    accentColor: "#d946ef",
  },
  {
    id: "n-queens",
    name: "N-Queens",
    subtitle: "Backtracking",
    description:
      "Places N queens on an N×N chessboard so no two queens threaten each other. Uses backtracking to prune invalid branches and find the first solution.",
    category: "Backtracking",
    timeComplexity: "O(n!)",
    spaceComplexity: "O(n)",
    note: "Backtracking · Constraint",
    gradient: "from-indigo-500 to-blue-600",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-400",
    accentColor: "#6366f1",
  },
  {
    id: "kmp",
    name: "KMP String Matching",
    subtitle: null,
    description:
      "Knuth-Morris-Pratt searches for a pattern in text in O(n+m) by precomputing a failure function that avoids redundant character comparisons on mismatch.",
    category: "Strings",
    timeComplexity: "O(n + m)",
    spaceComplexity: "O(m)",
    note: "Failure function · Linear",
    gradient: "from-yellow-500 to-amber-600",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    accentColor: "#eab308",
  },
  {
    id: "bst",
    name: "Binary Search Tree",
    subtitle: "Insert & Search",
    description:
      "Inserts a sequence of values into a BST then performs a search. Watch the tree grow node by node and trace comparison steps down to the target.",
    category: "Data Structures",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(n)",
    note: "Average case · O(n) worst",
    gradient: "from-cyan-500 to-sky-600",
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    accentColor: "#06b6d4",
  },
  {
    id: "heap",
    name: "Max-Heap",
    subtitle: "Build · Insert · Extract",
    description:
      "Visualizes a max-heap with dual array and tree views. Run build-heap on an unsorted array, insert a new element via sift-up, or extract the maximum.",
    category: "Data Structures",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(1)",
    note: "Build-heap O(n) · In-place",
    gradient: "from-orange-500 to-red-600",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    accentColor: "#f97316",
  },
];

export const CATEGORIES: Category[] = [
  "Cellular Automata",
  "Sorting",
  "Graph Traversal",
  "Pathfinding",
  "Minimum Spanning Tree",
  "Dynamic Programming",
  "Backtracking",
  "Strings",
  "Data Structures",
];
