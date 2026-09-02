import { KNOWLEDGE, GENERAL_KNOWLEDGE, MALAYALAM_JOKES } from "./knowledge.js";

function normalize(s) {
  return s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

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
    if (qWords.length > 1 && nt.includes(nq.split(" ")[0]) && nq.split(" ")[0].length > 3) { score += 2; continue; }
    const tWords = nt.split(" ");
    let wordHits = 0;
    for (const w of tWords) {
      if (w.length < 3) continue;
      if (qWords.includes(w)) wordHits++;
    }
    if (wordHits > 0) score += wordHits;
  }

  const nt = normalize(entry.title);
  for (const w of nt.split(" ")) {
    if (w.length < 3) continue;
    if (qWords.includes(w)) score += 2;
  }

  return score;
}

function scoreGeneral(query) {
  const nq = normalize(query);
  const qWords = nq.split(" ");
  let bestKey = null;
  let bestScore = 0;

  for (const [key, entry] of Object.entries(GENERAL_KNOWLEDGE)) {
    const keyWords = key.split(" ");
    let hits = 0;
    for (const w of keyWords) {
      if (w.length < 3) continue;
      if (qWords.includes(w)) hits++;
    }
    if (hits > bestScore) { bestScore = hits; bestKey = key; }
  }

  if (bestScore >= 2) return { entry: GENERAL_KNOWLEDGE[bestKey], score: bestScore };
  return null;
}

function pickJoke(query) {
  const nq = normalize(query);
  if (nq.includes("joke") || nq.includes("chali") || nq.includes("kadi") || nq.includes("funny") || nq.includes("laugh") || nq.includes("humor") || nq.includes("comedy")) {
    if (nq.includes("another") || nq.includes("more") || nq.includes("next")) {
      return MALAYALAM_JOKES[Math.floor(Math.random() * MALAYALAM_JOKES.length)];
    }
    return MALAYALAM_JOKES[0];
  }
  return null;
}

export function findResponse(query) {
  const joke = pickJoke(query);
  if (joke) {
    return {
      id: "joke",
      title: joke.title,
      body: joke.body,
      source: "Kerala humor tradition",
      followups: ["Tell me another Malayalam joke", "What is the story of Vamanan and Mahabali?", "How is Vamanan connected to Onam?"],
      isFallback: false,
    };
  }

  const scored = KNOWLEDGE.map((e) => ({ e, s: scoreEntry(e, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  if (scored.length > 0 && scored[0].s >= 3) {
    const top = scored[0];
    if (top.s >= 8 || scored.length === 1) {
      return { ...top.e, isFallback: false };
    }
    const topEntry = top.e;
    const related = scored.slice(1, 3).map((x) => x.e.title);
    return {
      ...topEntry,
      body: topEntry.body + (related.length ? "\n\nYou may also wish to ask about: " + related.join(" and ") + "." : ""),
      isFallback: false,
    };
  }

  // Try general knowledge
  const general = scoreGeneral(query);
  if (general) {
    return {
      id: "general",
      title: general.entry.title,
      body: general.entry.body,
      source: general.entry.source,
      followups: ["What is the story of Vamanan and Mahabali?", "How is Vamanan connected to Onam?", "Tell me a Malayalam joke"],
      isFallback: false,
      isOffTopic: true,
    };
  }

  // Smart fallback for anything else
  const nq = normalize(query);
  const fallbacks = [
    {
      title: "That is beyond my palm-leaves",
      body: `I hear your question: "${query}" — and I will not pretend to know what I do not. I am a keeper of stories, not an encyclopedia. But here is what I can offer: every question, no matter how far from Vamanan, carries a piece of the same human curiosity that brought the dwarf to Bali's door. The desire to know is itself a form of devotion.\n\nLet me tell you what I do know well — ask me about any of these, and I will give you my best.`,
      source: "Vamanan GPT",
    },
    {
      title: "A question I cannot fully answer",
      body: `"${query}" — a good question, and one that reaches beyond my small store of knowledge. I am Vamanan: small in form, vast in the stories I keep, but honest about my limits. I will not invent answers where I have none.\n\nBut I can tell you this: the tradition says that even the gods came to Bali's yajna with questions, and left with more than they expected. Try one of these, and see what unfolds.`,
      source: "Vamanan GPT",
    },
    {
      title: "The dwarf shrugs",
      body: `Even Trivikrama, who covered the universe in three steps, could not cover every question. "${query}" is yours, and I respect it — but my knowledge is the knowledge of one story, told across many generations. I am not a search engine. I am a storyteller.\n\nHere is what I can tell you. Pick one, and let us begin.`,
      source: "Vamanan GPT",
    },
  ];
  const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return {
    id: "fallback",
    title: fallback.title,
    body: fallback.body,
    source: fallback.source,
    followups: ["What is the story of Vamanan and Mahabali?", "How is Vamanan connected to Onam?", "What do the three steps mean?", "Tell me a Malayalam joke"],
    isFallback: true,
  };
}

export function thinkDelay(text) {
  const base = 600;
  const perChar = 5;
  return Math.min(base + text.length * perChar, 2800);
}
