export interface KMPFrame {
  phase: "failure" | "search";
  failureTable: (number | null)[];
  textIdx: number;
  patIdx: number;
  matchStart: number;
  match: number[] | null; // indices in text where match was found
  activeLine: number;
  mismatch: boolean;
}

// Line mapping matching codeSnippets 'kmp'
const FL = { init: 1, loop: 2, match: 3, mismatch: 4, store: 5 };
const SL = {
  init: 8,
  loop: 9,
  match: 10,
  storeMatch: 11,
  advance: 12,
  fallback: 13,
  noMatch: 14,
};

export function getKMPFrames(text: string, pattern: string): KMPFrame[] {
  const frames: KMPFrame[] = [];
  const n = text.length,
    m = pattern.length;
  const fail: (number | null)[] = new Array(m).fill(null);
  const matches: number[] = [];

  const snap = (
    phase: "failure" | "search",
    ti: number,
    pi: number,
    ms: number,
    mismatch: boolean,
    line: number,
  ): KMPFrame => ({
    phase,
    failureTable: [...fail],
    textIdx: ti,
    patIdx: pi,
    matchStart: ms,
    match: matches.length ? [...matches] : null,
    activeLine: line,
    mismatch,
  });

  // Build failure table
  fail[0] = 0;
  let len = 0,
    fi = 1;
  frames.push(snap("failure", 0, 0, 0, false, FL.init));
  while (fi < m) {
    frames.push(snap("failure", 0, fi, 0, false, FL.loop));
    if (pattern[fi] === pattern[len]) {
      len++;
      fail[fi] = len;
      frames.push(snap("failure", 0, fi, 0, false, FL.match));
      frames.push(snap("failure", 0, fi, 0, false, FL.store));
      fi++;
    } else {
      frames.push(snap("failure", 0, fi, 0, true, FL.mismatch));
      if (len > 0) {
        len = fail[len - 1] ?? 0;
      } else {
        fail[fi] = 0;
        fi++;
      }
    }
  }

  // Search
  let ti = 0,
    pi = 0;
  frames.push(snap("search", ti, pi, ti - pi, false, SL.init));
  while (ti < n) {
    frames.push(snap("search", ti, pi, ti - pi, false, SL.loop));
    if (text[ti] === pattern[pi]) {
      frames.push(snap("search", ti, pi, ti - pi, false, SL.match));
      ti++;
      pi++;
      if (pi === m) {
        matches.push(ti - pi);
        frames.push(snap("search", ti, pi, ti - pi, false, SL.storeMatch));
        pi = fail[pi - 1] ?? 0;
      } else {
        frames.push(snap("search", ti, pi, ti - pi, false, SL.advance));
      }
    } else {
      frames.push(snap("search", ti, pi, ti - pi, true, SL.fallback));
      if (pi > 0) {
        pi = fail[pi - 1] ?? 0;
      } else {
        frames.push(snap("search", ti, pi, ti, true, SL.noMatch));
        ti++;
      }
    }
  }
  return frames;
}

export const DEFAULT_TEXT = "ABABDABACDABABCABAB";
export const DEFAULT_PATTERN = "ABABCABAB";
