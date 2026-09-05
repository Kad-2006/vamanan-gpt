import { useState, useRef, useEffect, useCallback } from "react";
import { findResponse, thinkDelay } from "./engine.js";
import { STARTERS } from "./knowledge.js";
import { supabase } from "./lib/supabase.js";

const GREETING = {
  role: "assistant",
  title: "Namaskaram",
  text: "Onashamsakal! I am Vamanan GPT — a keeper of Kerala's oldest stories and a companion for curious minds. Ask me about Vamanan, Mahabali, the three steps, Onam, the Sadya, or anything at all. I answer with what the tradition holds, and a little mischief when the mood is right.",
  source: "Vamanan GPT",
};

const GREETINGS = [
  "Onashamsakal! Ask me anything.",
  "Namaskaram! The stories are ready.",
  "Welcome, friend. What shall we explore?",
  "Ponnonam! The flowers are blooming.",
  "Come, sit. The lamp is lit.",
];

const MARQUEE_ITEMS = [
  "𑁍 Did you know? Vamanan is the only avatar of Vishnu who conquers without a weapon — just a request.",
  "𑁍 Onam tip: The Pookkalam grows one ring every day for 10 days, from Atham to Thiruvonam.",
  "𑁍 Fact: Thrikkakara Temple in Kochi is believed to be the exact spot where Vamanan received Mahabali's offering.",
  "𑁍 Tip: A traditional Sadya has 20+ dishes served on a banana leaf — always eaten with the hands, seated on the floor.",
  "𑁍 Fact: The word 'Vamana' means 'dwarf' in Sanskrit — the infinite choosing to be called the smallest.",
  "𑁍 Onam tip: Marigold (jamanthi) is the most used flower in Pookkalams — its bright orange symbolizes the sun.",
  "𑁍 Fact: Mahabali was so beloved that even today Keralites sing 'Maveli Naadu Vaneedum Kalam' — a song about his golden reign.",
  "𑁍 Tip: During Vallamkali, a single chundan boat can carry 100+ rowers rowing in perfect unison.",
];

function VamananAvatar({ size = 56, thinking = false }) {
  const uid = `v${size}-${thinking ? "t" : "s"}`;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={`vamanan-svg ${thinking ? "thinking" : ""}`}>
      <defs>
        <radialGradient id={`${uid}-aura`} cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#FF5722" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-crown`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE082" /><stop offset="1" stopColor="#FFB300" />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF8E1" /><stop offset="1" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id={`${uid}-umb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#66BB6A" /><stop offset="1" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill={`url(#${uid}-aura)`} className="vamanan-aura" />
      <circle cx="40" cy="40" r="34" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
      {/* Palm-leaf umbrella (Olla Kuda) behind head */}
      <g transform="translate(40 20)">
        <path d="M-14 -2 C-14 -10 -8 -14 0 -14 C8 -14 14 -10 14 -2 Z" fill={`url(#${uid}-umb)`} />
        <path d="M-10 -2 C-10 -8 -6 -12 0 -12" stroke="#2E7D32" strokeWidth="0.5" fill="none" opacity="0.5" />
        <path d="M10 -2 C10 -8 6 -12 0 -12" stroke="#2E7D32" strokeWidth="0.5" fill="none" opacity="0.5" />
        <line x1="0" y1="-14" x2="0" y2="-2" stroke="#2E7D32" strokeWidth="0.5" opacity="0.4" />
        <circle cx="0" cy="-14" r="1.2" fill="#FFD700" />
      </g>
      {/* Big round chibi head */}
      <circle cx="40" cy="34" r="13" fill="#FFCC99" />
      {/* Big expressive eyes */}
      <ellipse cx="34" cy="33" rx="2.5" ry="3" fill="#fff" />
      <ellipse cx="46" cy="33" rx="2.5" ry="3" fill="#fff" />
      <circle cx="34" cy="34" r="1.8" fill="#3D1F00" className="vamanan-eye" />
      <circle cx="46" cy="34" r="1.8" fill="#3D1F00" className="vamanan-eye" />
      <circle cx="34.6" cy="33.4" r="0.6" fill="#fff" />
      <circle cx="46.6" cy="33.4" r="0.6" fill="#fff" />
      {/* Rosy cheeks */}
      <circle cx="30" cy="38" r="1.8" fill="#FF8A80" opacity="0.5" />
      <circle cx="50" cy="38" r="1.8" fill="#FF8A80" opacity="0.5" />
      {/* Cute smile */}
      <path d="M35 39 Q40 43 45 39" stroke="#8B4513" strokeWidth="0.9" fill="none" strokeLinecap="round" className="vamanan-smile" />
      {/* Golden crown */}
      <path d="M28 22 L31 16 L34 20 L37 14 L40 18 L43 14 L46 20 L49 16 L52 22 Z" fill={`url(#${uid}-crown)`} stroke="#B8860B" strokeWidth="0.3" />
      <circle cx="31" cy="16" r="1" fill="#FF5722" />
      <circle cx="40" cy="14" r="1.2" fill="#E91E63" />
      <circle cx="49" cy="16" r="1" fill="#FF5722" />
      {/* Small body in dhoti */}
      <ellipse cx="40" cy="54" rx="9" ry="7" fill={`url(#${uid}-body)`} />
      <line x1="40" y1="47" x2="40" y2="61" stroke="#D4AF37" strokeWidth="0.4" opacity="0.4" />
      {/* Tiny legs */}
      <rect x="37" y="60" width="3" height="6" rx="1.5" fill="#FFCC99" />
      <rect x="41" y="60" width="3" height="6" rx="1.5" fill="#FFCC99" />
    </svg>
  );
}

function PulikaliMask({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="puliFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB300" /><stop offset="1" stopColor="#FF8F00" />
        </linearGradient>
      </defs>
      {/* Tiger face */}
      <circle cx="20" cy="20" r="16" fill="url(#puliFace)" />
      {/* Black stripes */}
      <path d="M8 14 L12 18" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 22 L11 22" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 28 L13 25" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 14 L28 18" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 22 L29 22" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M31 28 L27 25" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 6 L20 11" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 8 L17 12" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 8 L23 12" stroke="#1B1B1B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Ears */}
      <path d="M8 8 L6 4 L12 6 Z" fill="#FF8F00" stroke="#1B1B1B" strokeWidth="0.5" />
      <path d="M32 8 L34 4 L28 6 Z" fill="#FF8F00" stroke="#1B1B1B" strokeWidth="0.5" />
      {/* Eyes */}
      <circle cx="14" cy="18" r="3" fill="#fff" />
      <circle cx="26" cy="18" r="3" fill="#fff" />
      <circle cx="14" cy="18" r="1.5" fill="#1B1B1B" />
      <circle cx="26" cy="18" r="1.5" fill="#1B1B1B" />
      <circle cx="14.5" cy="17.5" r="0.5" fill="#fff" />
      <circle cx="26.5" cy="17.5" r="0.5" fill="#fff" />
      {/* Nose */}
      <path d="M17 24 L20 27 L23 24 Z" fill="#E91E63" />
      {/* Mouth/whiskers */}
      <path d="M20 27 Q18 31 15 30" stroke="#5D4037" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M20 27 Q22 31 25 30" stroke="#5D4037" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M8 24 L14 25" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
      <path d="M8 27 L14 27" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
      <path d="M32 24 L26 25" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
      <path d="M32 27 L26 27" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}

function OllaKudaIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="kudaLeaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4CAF50" /><stop offset="1" stopColor="#2E7D32" />
        </linearGradient>
        <linearGradient id="kudaHandle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8D6E63" /><stop offset="1" stopColor="#5D4037" />
        </linearGradient>
      </defs>
      <path d="M20 4 C10 4 4 12 4 18 L36 18 C36 12 30 4 20 4 Z" fill="url(#kudaLeaf)" />
      <path d="M20 4 C16 4 12 8 10 18" stroke="#2E7D32" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M20 4 C24 4 28 8 30 18" stroke="#2E7D32" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M20 4 L20 18" stroke="#2E7D32" strokeWidth="0.6" opacity="0.5" />
      <rect x="19" y="18" width="2" height="16" rx="1" fill="url(#kudaHandle)" />
      <ellipse cx="20" cy="35" rx="3" ry="1" fill="#5D4037" opacity="0.6" />
      <circle cx="20" cy="5" r="1.5" fill="#FFD700" />
    </svg>
  );
}

function NilavilakkuIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="14" rx="4" ry="1.2" fill="#D4AF37" opacity="0.5" />
      <path d="M6 13 L7 8 L9 8 L10 13 Z" fill="#D4AF37" />
      <ellipse cx="8" cy="8" rx="2" ry="0.8" fill="#FFD700" />
      <path d="M8 8 Q7 5 8 3 Q9 5 8 8" fill="#FF5722" className="lamp-flame" />
    </svg>
  );
}

function SpinningPookkalam({ onSegmentClick }) {
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngle = useRef(0);
  const rafRef = useRef(null);
  const containerRef = useRef(null);

  const getAngle = (e, rect) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - cx;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - cy;
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  const handleStart = (e) => {
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    lastAngle.current = getAngle(e, rect);
    setVelocity(0);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const angle = getAngle(e, rect);
    let delta = angle - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    setRotation((r) => r + delta);
    setVelocity(delta);
    lastAngle.current = angle;
  };

  const handleEnd = () => { setIsDragging(false); };

  useEffect(() => {
    if (!isDragging && Math.abs(velocity) > 0.1) {
      rafRef.current = requestAnimationFrame(() => {
        setRotation((r) => r + velocity);
        setVelocity((v) => v * 0.95);
      });
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isDragging, velocity]);

  const segments = [
    { color: "#FFD700", label: "Marigold", trivia: "Marigold (jamanthi) is the most used flower in Onam pookkalams — its bright yellow symbolizes the sun and the harvest." },
    { color: "#FF5722", label: "Flame Orange", trivia: "Deep orange marigolds add fire and energy to the pookkalam — they represent the warmth of the Onam celebration." },
    { color: "#E91E63", label: "Crimson Rose", trivia: "Crimson roses add passion and depth — modern pookkalams use them, but traditional ones used only native Kerala flowers." },
    { color: "#4CAF50", label: "Leaf Green", trivia: "Fresh green leaves and petals represent the harvest and the lush Kerala landscape after the monsoon." },
    { color: "#FFD700", label: "Chrysanthemum", trivia: "Yellow chrysanthemums represent prosperity and are placed in alternating rings with marigold." },
    { color: "#FF5722", label: "Jamanthi", trivia: "Orange jamanthi (marigold) is the signature flower of Onam — its color fills every pookkalam across Kerala." },
    { color: "#E91E63", label: "Chembarathi", trivia: "Hibiscus (chembarathi) adds deep crimson to the pookkalam — it is also sacred to Devi." },
    { color: "#4CAF50", label: "Thumba Green", trivia: "Thumba (small white flowers) are traditional — they were once the only flowers used in the earliest pookkalams." },
  ];

  return (
    <div
      ref={containerRef}
      className="pookkalam-widget"
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onWheel={(e) => { setRotation((r) => r + (e.deltaY > 0 ? 5 : -5)); }}
    >
      <svg viewBox="-100 -100 200 200" className="pookkalam-svg" style={{ transform: `rotate(${rotation}deg)` }}>
        {segments.map((seg, i) => {
          const startAngle = (i * 360 / segments.length) * (Math.PI / 180);
          const endAngle = ((i + 1) * 360 / segments.length) * (Math.PI / 180);
          const r1 = 95, r2 = 60, r3 = 30;
          const x1 = Math.cos(startAngle) * r1, y1 = Math.sin(startAngle) * r1;
          const x2 = Math.cos(endAngle) * r1, y2 = Math.sin(endAngle) * r1;
          const x3 = Math.cos(endAngle) * r2, y3 = Math.sin(endAngle) * r2;
          const x4 = Math.cos(startAngle) * r2, y4 = Math.sin(startAngle) * r2;
          const x5 = Math.cos(startAngle) * r3, y5 = Math.sin(startAngle) * r3;
          const x6 = Math.cos(endAngle) * r3, y6 = Math.sin(endAngle) * r3;
          return (
            <g key={i} className="pookkalam-segment" onClick={() => onSegmentClick?.(seg)}>
              <path d={`M${x1} ${y1} A${r1} ${r1} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r2} ${r2} 0 0 0 ${x4} ${y4} Z`} fill={seg.color} opacity="0.9" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <path d={`M${x5} ${y5} A${r3} ${r3} 0 0 1 ${x6} ${y6} L${x4} ${y4} A${r2} ${r2} 0 0 0 ${x5} ${y5} Z`} fill={seg.color} opacity="0.7" />
            </g>
          );
        })}
        <circle cx="0" cy="0" r="30" fill="#4CAF50" stroke="#FFD700" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="22" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.8" />
        <circle cx="0" cy="0" r="14" fill="#FFD700" opacity="0.4" />
        <circle cx="0" cy="0" r="8" fill="#FF5722" opacity="0.6" className="pookkalam-center-dot" />
      </svg>
      <div className="pookkalam-hint">Drag to spin · Click a petal</div>
    </div>
  );
}

function TypewriterText({ text, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    let timer;
    function tick() {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { setDone(true); onDone?.(); return; }
      const ch = text[i - 1];
      const delay = ch === "\n" ? 40 : ch === "." || ch === "," || ch === "!" || ch === "?" ? 20 : 8;
      timer = setTimeout(tick, delay);
    }
    timer = setTimeout(tick, 30);
    return () => clearTimeout(timer);
  }, [text]);
  useEffect(() => { if (done) onDone?.(); }, [done]);
  return <span className={`msg-text ${done ? "done" : "typing"}`}>{displayed}{!done && <span className="cursor" />}</span>;
}

function Message({ msg, onFollowup, animate }) {
  const isUser = msg.role === "user";
  return (
    <div className={`msg-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && <div className="msg-avatar"><VamananAvatar size={36} /></div>}
      <div className={`msg-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
        {!isUser && msg.title && <div className="assistant-title"><NilavilakkuIcon size={12} /> {msg.title}</div>}
        {isUser ? <div className="msg-text">{msg.text}</div> : animate ? <TypewriterText text={msg.text} /> : <div className="msg-text">{msg.text}</div>}
        {!isUser && msg.source && <div className="assistant-source">— {msg.source}</div>}
        {!isUser && msg.followups && msg.followups.length > 0 && (
          <div className="followup-pills">
            {msg.followups.map((f, i) => (<button key={i} className="followup-pill" onClick={() => onFollowup?.(f)}>{f}</button>))}
          </div>
        )}
      </div>
      {isUser && <div className="msg-avatar user-av"><PulikaliMask size={28} /></div>}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="msg-row assistant">
      <div className="msg-avatar"><VamananAvatar size={36} thinking /></div>
      <div className="msg-bubble assistant-bubble typing-bubble"><span /><span /><span /></div>
    </div>
  );
}

function PetalShower({ trigger }) {
  const [petals, setPetals] = useState([]);
  useEffect(() => {
    if (trigger <= 0) return;
    const colors = ["#FFD700", "#FF5722", "#E91E63", "#4CAF50", "#FFFFFF"];
    const newPetals = Array.from({ length: 24 }).map((_, i) => ({
      id: `${trigger}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 60,
    }));
    setPetals(newPetals);
    const timer = setTimeout(() => setPetals([]), 5000);
    return () => clearTimeout(timer);
  }, [trigger]);
  if (petals.length === 0) return null;
  return (
    <div className="petal-shower">
      {petals.map((p) => (
        <div key={p.id} className="petal" style={{
          left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
          background: p.color, width: `${p.size}px`, height: `${p.size}px`, "--drift": `${p.drift}px`,
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [memoryReady, setMemoryReady] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [blessingCount, setBlessingCount] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [hoverGreeting, setHoverGreeting] = useState("");
  const [triviaCard, setTriviaCard] = useState(null);
  const [petalTrigger, setPetalTrigger] = useState(0);
  const [lastAnimIdx, setLastAnimIdx] = useState(-1);
  const [isResetting, setIsResetting] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [mobilePookkalam, setMobilePookkalam] = useState(false);
  const audioRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function loadConversation() {
      let sessionId = localStorage.getItem("vamanan-session");
      if (!sessionId) { sessionId = crypto.randomUUID(); localStorage.setItem("vamanan-session", sessionId); }
      const { data: conversation } = await supabase.from("conversations").select("id").eq("session_id", sessionId).order("created_at", { ascending: false }).limit(1).maybeSingle();
      let id = conversation?.id;
      if (!id) {
        const created = await supabase.from("conversations").insert({ session_id: sessionId, title: "A story begins" }).select("id").maybeSingle();
        id = created.data?.id;
      }
      if (!id || cancelled) return;
      setConversationId(id);
      const { data: saved } = await supabase.from("messages").select("role, text, title, source").eq("conversation_id", id).order("created_at", { ascending: true });
      if (cancelled) return;
      if (saved?.length) {
        setMessages(saved);
        setHasStarted(saved.some((m) => m.role === "user"));
        setBlessingCount(saved.filter((m) => m.role === "assistant").length);
      } else {
        setMessages([GREETING]);
        await supabase.from("messages").insert({ conversation_id: id, role: GREETING.role, text: GREETING.text, title: GREETING.title, source: GREETING.source });
      }
      setMemoryReady(true);
    }
    loadConversation();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking, triviaCard]);

  const saveMessage = async (message) => {
    if (!conversationId) return;
    await supabase.from("messages").insert({ conversation_id: conversationId, role: message.role, text: message.text, title: message.title || null, source: message.source || null });
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  };

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(`${import.meta.env.BASE_URL}onam_evergreen_tune.mp3`);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
    }
    if (musicOn) {
      audioRef.current.pause();
      setMusicOn(false);
    } else {
      audioRef.current.play().catch(() => {});
      setMusicOn(true);
    }
  }, [musicOn]);

  const resetChat = useCallback(async () => {
    if (isResetting || !conversationId) return;
    setIsResetting(true);
    await supabase.from("messages").delete().eq("conversation_id", conversationId);
    setMessages([GREETING]);
    setHasStarted(false);
    setBlessingCount(0);
    setLastAnimIdx(-1);
    await supabase.from("messages").insert({ conversation_id: conversationId, role: GREETING.role, text: GREETING.text, title: GREETING.title, source: GREETING.source });
    setIsResetting(false);
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [conversationId, isResetting]);

  const send = useCallback((query) => {
    const text = (query ?? input).trim();
    if (!text || isThinking || !memoryReady) return;
    setInput(""); setHasStarted(true);
    const userMessage = { role: "user", text };
    setMessages((current) => [...current, userMessage]); saveMessage(userMessage);
    const response = findResponse(text);
    setIsThinking(true);
    setTimeout(() => {
      const answer = { role: "assistant", title: response.title, text: response.body, source: response.source, followups: response.followups };
      setMessages((current) => [...current, answer]); saveMessage(answer); setIsThinking(false);
      setBlessingCount((c) => c + 1);
      setLastAnimIdx(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, thinkDelay(response.body));
  }, [input, isThinking, memoryReady, conversationId]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant" && lastAnimIdx < 0) {
      setLastAnimIdx(messages.length - 1);
    }
  }, [messages, lastAnimIdx]);

  return (
    <div className="festive-shell">
      <div className="glow-orb orb-1" /><div className="glow-orb orb-2" /><div className="glow-orb orb-3" />
      <PetalShower trigger={petalTrigger} />

      <nav className="festive-nav">
        <div className="kasavu-border" />
        <div className="nav-brand" onMouseEnter={() => setHoverGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])} onMouseLeave={() => setHoverGreeting("")}>
          <div className="nav-avatar"><VamananAvatar size={48} thinking={isThinking} /></div>
          <div className="nav-text">
            <div className="nav-name">Vamanan <span>GPT</span></div>
            <div className="nav-sub">{memoryReady ? "Archive Awake" : "Indexing..."}</div>
          </div>
          {hoverGreeting && <div className="nav-greeting-bubble">{hoverGreeting}</div>}
        </div>
        <div className="nav-actions">
          <button className="nav-action-btn reset-btn" onClick={resetChat} disabled={isResetting || !memoryReady} title="Reset chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            <span>Reset</span>
          </button>
          <button className="sidebar-toggle" onClick={() => {
            if (window.innerWidth <= 700) { setMobilePookkalam(true); }
            else { setShowSidebar((s) => !s); }
          }}>
            {showSidebar ? "Hide Pookkalam" : "Show Pookkalam"}
          </button>
        </div>
      </nav>
      <div className="marquee-bar">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (<span key={i} className="marquee-item">{item}</span>))}
          {MARQUEE_ITEMS.map((item, i) => (<span key={`d-${i}`} className="marquee-item">{item}</span>))}
        </div>
      </div>

      <div className="festive-body">
        {showSidebar && (
          <aside className="festive-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Pookkalam <span className="malayalam-text">പൂക്കളം</span></h3>
              <p className="sidebar-desc">Spin the Pookkalam. Click a petal for Onam trivia.</p>
              <SpinningPookkalam onSegmentClick={(seg) => setTriviaCard(seg)} />
            </div>
            <div className="sidebar-card blessing-card">
              <h3 className="sidebar-title">Maveli's Blessing Counter</h3>
              <div className="blessing-vessel" onClick={() => setPetalTrigger((t) => t + 1)} style={{ cursor: "pointer" }}>
                <div className="rice-grains">
                  {Array.from({ length: Math.min(blessingCount, 30) }).map((_, i) => (
                    <span key={i} className="rice-grain" style={{ animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
                <div className="blessing-count">{blessingCount}</div>
                <div className="blessing-label">{blessingCount === 1 ? "blessing given" : "blessings given"}</div>
                <div className="blessing-tap-hint">Tap for petals</div>
              </div>
            </div>
          </aside>
        )}
        {showSidebar && <div className="sidebar-divider" />}

        <div className="chat-column">
          <main ref={scrollRef} className="festive-scroll scrollbar">
            <div className="festive-container">
              {!hasStarted && (
                <div className="festive-hero">
                  <span className="hero-tag">Ponnonam · Kerala 2026</span>
                  <h1 className="hero-heading">Where the smallest <span>step</span> holds the world.</h1>
                  <p className="hero-text">Explore the lore of Mahabali, the cadence of old songs, and the traditions of Kerala. Ask anything — on-topic or off. Vamanan answers with story, wit, and honesty.</p>
                  <div className="starter-pills">
                    {STARTERS.map((s) => (
                      <button key={s.query} className="starter-pill" onClick={() => send(s.query)}>
                        <span className="pill-emoji">{s.emoji}</span><span className="pill-label">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, idx) => <Message key={idx} msg={m} onFollowup={send} animate={idx === lastAnimIdx} />)}
              {isThinking && <TypingDots />}
            </div>
          </main>

          <footer className="festive-footer">
            <div className="kasavu-border-bottom" />
            <div className="festive-input-wrap">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Chodikkumbol ellam parayam... (Ask anything)" rows={1} />
              <button className={`festive-send ${input.trim() && !isThinking ? "active" : ""}`} onClick={() => send()} disabled={!input.trim() || isThinking || !memoryReady}>
                <OllaKudaIcon size={20} />
              </button>
            </div>
            <div className="composer-note">By: Kareena Alexander</div>
          </footer>
        </div>
      </div>

      <button className={`floating-music ${musicOn ? "playing" : ""}`} onClick={toggleMusic} title="Toggle Onam music">
        <span className="music-wave">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {musicOn ? (
              <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>
            ) : (
              <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><line x1="3" y1="3" x2="21" y2="21" /></>
            )}
          </svg>
        </span>
        <span className="music-label">{musicOn ? "Mute Onam Music" : "Play Onam Music"}</span>
      </button>

      {mobilePookkalam && (
        <>
          <div className="mobile-drawer-overlay" onClick={() => setMobilePookkalam(false)} />
          <div className="mobile-drawer scrollbar">
            <button className="mobile-drawer-close" onClick={() => setMobilePookkalam(false)}>×</button>
            <div className="sidebar-card">
              <h3 className="sidebar-title">Pookkalam <span className="malayalam-text">പൂക്കളം</span></h3>
              <p className="sidebar-desc">Spin the Pookkalam. Click a petal for Onam trivia.</p>
              <SpinningPookkalam onSegmentClick={(seg) => { setTriviaCard(seg); }} />
            </div>
            <div className="sidebar-card blessing-card">
              <h3 className="sidebar-title">Maveli's Blessing Counter</h3>
              <div className="blessing-vessel" onClick={() => setPetalTrigger((t) => t + 1)} style={{ cursor: "pointer" }}>
                <div className="rice-grains">
                  {Array.from({ length: Math.min(blessingCount, 30) }).map((_, i) => (
                    <span key={i} className="rice-grain" style={{ animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
                <div className="blessing-count">{blessingCount}</div>
                <div className="blessing-label">{blessingCount === 1 ? "blessing given" : "blessings given"}</div>
                <div className="blessing-tap-hint">Tap for petals</div>
              </div>
            </div>
          </div>
        </>
      )}

      {triviaCard && (
        <div className="trivia-overlay" onClick={() => setTriviaCard(null)}>
          <div className="trivia-card" onClick={(e) => e.stopPropagation()}>
            <button className="trivia-close" onClick={() => setTriviaCard(null)}>×</button>
            <div className="trivia-color" style={{ background: triviaCard.color }} />
            <h4>{triviaCard.label}</h4>
            <p>{triviaCard.trivia}</p>
          </div>
        </div>
      )}
    </div>
  );
}
