import { useState, useEffect, useRef } from "react";
import { CODE, Lang, Snippet } from "../lib/codeSnippets";
import type { AlgoId } from "../lib/algos";
import { cn } from "../lib/utils";

interface Props {
  algoId: AlgoId | string;
  activeLine: number;
}

const LANG_LABELS: { key: Lang; label: string; color: string }[] = [
  { key: "ts", label: "TypeScript", color: "#3b82f6" },
  { key: "rust", label: "Rust", color: "#f97316" },
  { key: "java", label: "Java", color: "#a855f7" },
];

// Minimal syntax highlighter
const KW_RE =
  /\b(function|fn|const|let|mut|var|return|while|for|if|else|null|None|Some|pub|use|impl|struct|void|int|boolean|new|static|public|private|in|true|false|List|Map|Set|Queue|Deque)\b/g;
const NUM_RE = /\b(\d+)\b/g;
const STR_RE = /(["'`][^"'`]*["'`])/g;
const COMMENT_RE = /(\/\/.*$)/;
const TYPE_RE =
  /\b(number|string|boolean|Vec|HashMap|HashSet|VecDeque|Option|usize|i32)\b/g;

function highlight(line: string): React.ReactNode[] {
  // First handle comments (rest of line)
  const commentMatch = line.match(COMMENT_RE);
  const code = commentMatch ? line.slice(0, commentMatch.index) : line;
  const comment = commentMatch ? line.slice(commentMatch.index!) : "";

  const parts: React.ReactNode[] = [];
  let last = 0;

  // Simple token pass: find keywords, types, numbers, strings
  const tokens: { start: number; end: number; cls: string }[] = [];

  const addTokens = (re: RegExp, cls: string, src: string) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, cls });
    }
  };

  addTokens(STR_RE, "text-emerald-400", code);
  addTokens(KW_RE, "text-violet-400", code);
  addTokens(TYPE_RE, "text-cyan-400", code);
  addTokens(NUM_RE, "text-amber-300", code);

  // Sort and de-overlap
  tokens.sort((a, b) => a.start - b.start);
  const merged: typeof tokens = [];
  for (const t of tokens) {
    if (merged.length && t.start < merged[merged.length - 1].end) continue;
    merged.push(t);
  }

  for (const t of merged) {
    if (t.start > last) parts.push(code.slice(last, t.start));
    parts.push(
      <span key={t.start} className={t.cls}>
        {code.slice(t.start, t.end)}
      </span>,
    );
    last = t.end;
  }
  if (last < code.length) parts.push(code.slice(last));
  if (comment) parts.push(<span className="text-gray-500">{comment}</span>);

  return parts;
}

export default function CodeDisplay({ algoId, activeLine }: Props) {
  const [lang, setLang] = useState<Lang>("ts");
  const snippet = CODE[algoId as AlgoId] as Snippet | undefined;
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = lineRefs.current[activeLine];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeLine]);

  if (!snippet) return null;
  const lines = snippet[lang];

  return (
    <div className="bg-gray-900 rounded-xl border border-white/5 overflow-hidden">
      {/* Language tabs */}
      <div className="flex items-center border-b border-white/5 px-4 pt-3 pb-0 gap-1">
        {LANG_LABELS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors duration-150 border-b-2 -mb-px",
              lang === key
                ? "text-white border-current"
                : "text-white/40 border-transparent hover:text-white/60",
            )}
            style={lang === key ? { borderColor: color, color } : undefined}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto text-xs text-white/20 pb-1.5">
          line <span className="font-mono text-white/40">{activeLine + 1}</span>
        </div>
      </div>

      {/* Code */}
      <div className="overflow-y-auto h-52 py-2 font-mono text-[0.78rem] leading-5 select-none">
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className={cn(
              "flex px-4 transition-colors duration-100",
              i === activeLine
                ? "bg-yellow-500/15 border-l-2 border-yellow-400"
                : "border-l-2 border-transparent",
            )}
          >
            <span className="w-7 shrink-0 text-white/20 select-none text-right pr-3 text-[0.7rem] leading-5">
              {i + 1}
            </span>
            <span className="text-gray-300 whitespace-pre">
              {line === "" ? " " : highlight(line)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
