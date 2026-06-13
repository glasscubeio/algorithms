import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlgoId } from "./lib/algos";
import Landing from "./views/Landing";
import ConwaySquare from "./algorithms/cellular-automata/ConwaySquare";
import ConwayHex from "./algorithms/cellular-automata/ConwayHex";
import SortingVisualizer from "./algorithms/sorting/SortingVisualizer";
import GraphTraversal from "./algorithms/graph/GraphTraversal";
import PathfindingVisualizer from "./algorithms/pathfinding/PathfindingVisualizer";
import MSTVisualizer from "./algorithms/graph/MSTVisualizer";
import FibonacciDP from "./algorithms/dynamic-programming/FibonacciDP";
import KnapsackDP from "./algorithms/dynamic-programming/KnapsackDP";
import NQueens from "./algorithms/backtracking/NQueens";
import KMPVisualizer from "./algorithms/strings/KMPVisualizer";
import BSTVisualizer from "./algorithms/data-structures/BSTVisualizer";
import HeapVisualizer from "./algorithms/data-structures/HeapVisualizer";

const SORT_IDS: AlgoId[] = [
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "merge-sort",
  "quick-sort",
];
const GRAPH_IDS: AlgoId[] = ["bfs", "dfs"];
const PATH_IDS: AlgoId[] = ["dijkstra", "astar"];
const MST_IDS: AlgoId[] = ["kruskal", "prim"];

export default function App() {
  const [active, setActive] = useState<AlgoId | null>(null);
  const onBack = () => setActive(null);

  function renderActive() {
    if (!active) return null;
    if (active === "conway-square") return <ConwaySquare onBack={onBack} />;
    if (active === "conway-hex") return <ConwayHex onBack={onBack} />;
    if (SORT_IDS.includes(active))
      return <SortingVisualizer algorithm={active} onBack={onBack} />;
    if (GRAPH_IDS.includes(active))
      return <GraphTraversal algorithm={active} onBack={onBack} />;
    if (PATH_IDS.includes(active))
      return <PathfindingVisualizer algorithm={active} onBack={onBack} />;
    if (MST_IDS.includes(active))
      return <MSTVisualizer algorithm={active} onBack={onBack} />;
    if (active === "fibonacci-dp")
      return <FibonacciDP algorithm={active} onBack={onBack} />;
    if (active === "knapsack-dp")
      return <KnapsackDP algorithm={active} onBack={onBack} />;
    if (active === "n-queens")
      return <NQueens algorithm={active} onBack={onBack} />;
    if (active === "kmp")
      return <KMPVisualizer algorithm={active} onBack={onBack} />;
    if (active === "bst")
      return <BSTVisualizer algorithm={active} onBack={onBack} />;
    if (active === "heap")
      return <HeapVisualizer algorithm={active} onBack={onBack} />;
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {active === null ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Landing onSelect={setActive} />
        </motion.div>
      ) : (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderActive()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
