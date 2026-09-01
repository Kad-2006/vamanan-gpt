import { KNOWLEDGE } from "./knowledge.js";

// Normalize text for matching: lowercase, strip punctuation, collapse spaces.
function normalize(s) {
  return s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Score an entry against a query by counting keyword overlaps.
function scoreEntry(entry, query) {
  const nq = normalize(query);
  if (!nq) return 0;
  const qWords = nq.split(" ");
  let score = 0;

  for (const tag of entry.tags) {
    const nt = normalize(tag);
    if (nq === nt) { score += 10; continue; }
    if (nq.includes(nt)) { score += 5; continue; }
    if (nt.includes(nq) && nq.length > 3) { score += 3; continue; }
    // word-level overlap
    const tWords = nt.split(" ");
    let wordHits = 0;
    for (const w of tWords) {
      if (w.length < 3) continue;
      if (qWords.includes(w)) wordHits++;
    }
    if (wordHits > 0) score += wordHits;
  }

  // title boost
  const nt = normalize(entry.title);
  for (const w of nt.split(" ")) {
    if (w.length < 3) continue;
    if (qWords.includes(w)) score += 2;
  }

  return score;
}

export function findResponse(query) {
  const scored = KNOWLEDGE.map((e) => ({ e, s: scoreEntry(e, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (scored.length === 0) {
    return {
      id: "fallback",
      title: "I am not certain of that",
      body: "I am a small keeper of one story — the story of Vamanan. I can tell you about Vamanan, Mahabali, the three steps, Onam, what the name means, or what the tradition asks of us today. Try one of those, and I will give you what I know.",
      source: "Vamanan GPT",
      isFallback: true,
    };
  }

  // If the top match is very strong, return it alone.
  const top = scored[0];
  if (top.s >= 8 || scored.length === 1) {
    return { ...top.e, isFallback: false };
  }

  // Otherwise, return the top entry and mention related ones.
  const topEntry = top.e;
  const related = scored.slice(1, 3).map((x) => x.e.title);
  return {
    ...topEntry,
    body: topEntry.body + (related.length ? " You may also wish to ask about: " + related.join(" and ") + "." : ""),
    isFallback: false,
  };
}

// Simulate a "thinking" delay scaled to response length, with a minimum.
export function thinkDelay(text) {
  const base = 500;
  const perChar = 6;
  return Math.min(base + text.length * perChar, 2600);
}
