import { motion } from "framer-motion";
import {
  Hexagon,
  Grid2x2,
  ArrowUpDown,
  GitMerge,
  Zap,
  Layers,
  LucideGithub,
  Network,
  GitBranch,
  MapPin,
  Crosshair,
  Spline,
  TreePine,
  Hash,
  Package,
  Crown,
  Type,
  Binary,
  BarChart2,
} from "lucide-react";
import { ALGORITHMS, CATEGORIES, AlgoId, AlgoMeta } from "../lib/algos";

interface Props {
  onSelect: (id: AlgoId) => void;
}

const iconMap: Record<AlgoId, React.ReactNode> = {
  "conway-hex": <Hexagon size={16} />,
  "conway-square": <Grid2x2 size={16} />,
  "bubble-sort": <ArrowUpDown size={16} />,
  "selection-sort": <Zap size={16} />,
  "insertion-sort": <Layers size={16} />,
  "merge-sort": <GitMerge size={16} />,
  "quick-sort": <ArrowUpDown size={16} />,
  bfs: <Network size={16} />,
  dfs: <GitBranch size={16} />,
  dijkstra: <MapPin size={16} />,
  astar: <Crosshair size={16} />,
  kruskal: <Spline size={16} />,
  prim: <TreePine size={16} />,
  "fibonacci-dp": <Hash size={16} />,
  "knapsack-dp": <Package size={16} />,
  "n-queens": <Crown size={16} />,
  kmp: <Type size={16} />,
  bst: <Binary size={16} />,
  heap: <BarChart2 size={16} />,
};

function AlgoCard({
  algo,
  onSelect,
  index,
}: {
  algo: AlgoMeta;
  onSelect: (id: AlgoId) => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: "easeOut" }}
      onClick={() => onSelect(algo.id)}
      className="group w-full text-left bg-gray-900 border border-white/5 rounded-xl px-3.5 py-3
        hover:border-white/15 hover:bg-gray-800/80 transition-all duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
        flex items-center gap-3"
    >
      {/* Icon */}
      <div
        className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-transform duration-150 group-hover:scale-110"
        style={{
          backgroundColor: `${algo.accentColor}20`,
          color: algo.accentColor,
        }}
      >
        {iconMap[algo.id]}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="font-medium text-white text-sm truncate leading-tight">
            {algo.name}
          </span>
          {algo.subtitle && (
            <span
              className="text-xs shrink-0"
              style={{ color: algo.accentColor }}
            >
              · {algo.subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-mono text-white/30">
            {algo.timeComplexity}
          </span>
          <span className="text-white/15 text-xs">·</span>
          <span className="text-xs text-white/25 truncate">{algo.note}</span>
        </div>
      </div>

      {/* Arrow */}
      <span
        className="text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pr-0.5"
        style={{ color: algo.accentColor }}
      >
        →
      </span>
    </motion.button>
  );
}

export default function Landing({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 px-6 py-3 flex items-center justify-between sticky top-0 bg-gray-950/90 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="logo" className="h-7 w-7" />
          <span className="font-bold text-white tracking-tight text-sm">
            Algorithms
          </span>
        </div>
        <a
          href="https://github.com/glasscubeio/algorithms"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <LucideGithub size={15} />
          <span className="hidden sm:block">GitHub</span>
        </a>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 text-xs text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            19 algorithms · Interactive · Browser-native
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            <span className="bg-linear-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Algorithm{" "}
            </span>
            <span className="bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Visualizer
            </span>
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Click any algorithm to launch the interactive visualization with
            step-by-step code highlighting.
          </p>
        </motion.div>
      </div>

      {/* Algorithm grid by category */}
      <div className="max-w-5xl mx-auto px-6 pb-16 space-y-8">
        {CATEGORIES.map((category) => {
          const algos = ALGORITHMS.filter((a) => a.category === category);
          return (
            <section key={category}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 mb-3"
              >
                <h2 className="text-xs font-semibold text-white/35 uppercase tracking-widest">
                  {category}
                </h2>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-white/20">{algos.length}</span>
              </motion.div>

              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {algos.map((algo, i) => (
                  <AlgoCard
                    key={algo.id}
                    algo={algo}
                    onSelect={onSelect}
                    index={i}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 text-center text-xs text-white/20">
        Built with React, Vite, Tailwind CSS & Framer Motion
      </footer>
    </div>
  );
}
