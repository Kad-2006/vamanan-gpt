import { useState, useRef, useEffect, useCallback } from "react";
import { findResponse, thinkDelay } from "./engine.js";
import { STARTERS } from "./knowledge.js";
import { supabase } from "./lib/supabase.js";

const GREETING = {
  role: "assistant",
  text: "Namaskaram. I am Vamanan GPT — a small keeper of Kerala's old stories. Ask me about Vamanan, Mahabali, Onam, or the three steps. I will tell you what the tradition holds, and what it still asks of us.",
  source: "Vamanan GPT",
};

function DwarfGlyph({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2.2" /><path d="M12 7.5V13M12 9 7 11M12 9l5 2M12 13l-3 5M12 13l3 5" /></svg>;
}

function UserAvatar({ size = 21 }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none"><defs><linearGradient id="userG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8a5c" /><stop offset=".5" stopColor="#ff6b6b" /><stop offset="1" stopColor="#e84a5f" /></linearGradient><linearGradient id="userHalo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd93d" /><stop offset="1" stopColor="#ff8a5c" /></linearGradient></defs><circle cx="20" cy="20" r="19" fill="url(#userHalo)" opacity=".25" /><circle cx="20" cy="15" r="6.5" fill="url(#userG)" /><path d="M8 33c0-6.6 5.4-11 12-11s12 4.4 12 11" fill="url(#userG)" /><circle cx="20" cy="15" r="6.5" fill="none" stroke="#fff" strokeWidth=".8" opacity=".5" /></svg>;
}

function StepsMark({ size = 40 }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 38 16 30l10 8" opacity=".9" /><path d="m14 28 10-8 10 8" opacity=".65" /><path d="m22 18 10-8 10 8" opacity=".4" /></svg>;
}

function Pookkalam({ small = false }) {
  return <div className={`pookkalam ${small ? "pookkalam-small" : ""}`} aria-hidden="true"><span className="petal-ring ring-one" /><span className="petal-ring ring-two" /><span className="petal-ring ring-three" /><span className="pookkalam-center" /></div>;
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return <div className={`message-row ${isUser ? "user-row" : ""}`}>
    <div className={`message-avatar ${isUser ? "user-avatar" : "keeper-avatar"}`}>{isUser ? <UserAvatar size={21} /> : <DwarfGlyph size={21} />}</div>
    <div className={`message-bubble ${isUser ? "user-bubble" : "keeper-bubble"}`}>
      {!isUser && msg.title && <div className="message-title">{msg.title}</div>}
      <div className="message-text">{msg.text}</div>
      {!isUser && msg.source && <div className="message-source">— {msg.source}</div>}
    </div>
  </div>;
}

function TypingDots() {
  return <div className="typing-row"><div className="message-avatar keeper-avatar"><DwarfGlyph size={21} /></div><div className="typing-bubble"><span /><span /><span /></div></div>;
}

function ThreeSteps() {
  const [step, setStep] = useState(1);
  const stepData = [
    { title: "The Earth", sanskrit: "Bhūmi", text: "His first stride covers the earth — all that we can see, hold, and call ours.", symbol: "I" },
    { title: "The Heavens", sanskrit: "Dyauḥ", text: "His second reaches the heavens — all that we can imagine, desire, and become.", symbol: "II" },
    { title: "The Offering", sanskrit: "Ātman", text: "With nowhere left to step, Bali offers his own head. The self becomes the final gift.", symbol: "III" },
  ];
  const current = stepData[step - 1];
  return <section className="three-steps-card">
    <div className="steps-card-top"><div><span className="eyebrow">The moment of becoming</span><h3>Three steps to the infinite</h3></div><div className="trivikrama-mark"><StepsMark size={32} /></div></div>
    <div className="steps-visual" data-step={step}>
      <div className="cosmic-halo" /><div className="step-ground ground-one" /><div className="step-ground ground-two" /><div className="step-ground ground-three" />
      <div className="vamanan-figure"><div className="figure-crown" /><div className="figure-head" /><div className="figure-body" /><div className="figure-leg leg-left" /><div className="figure-leg leg-right" /><div className="figure-foot" /></div>
      <div className="step-label label-one">I</div><div className="step-label label-two">II</div><div className="step-label label-three">III</div>
    </div>
    <div className="step-content"><div className="step-number">{current.symbol}</div><div><div className="step-title-line"><h4>{current.title}</h4><span>{current.sanskrit}</span></div><p>{current.text}</p></div></div>
    <div className="step-controls">{stepData.map((item, index) => <button key={item.symbol} className={step === index + 1 ? "active" : ""} onClick={() => setStep(index + 1)}><span>{item.symbol}</span>{item.title}</button>)}</div>
  </section>;
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [memoryReady, setMemoryReady] = useState(false);
  const [conversationId, setConversationId] = useState(null);
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
      if (saved?.length) { setMessages(saved); setHasStarted(saved.some((message) => message.role === "user")); }
      else { setMessages([GREETING]); await supabase.from("messages").insert({ conversation_id: id, ...GREETING }); }
      setMemoryReady(true);
    }
    loadConversation();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, isThinking, showSteps]);

  const saveMessage = async (message) => {
    if (!conversationId) return;
    await supabase.from("messages").insert({ conversation_id: conversationId, role: message.role, text: message.text, title: message.title || null, source: message.source || null });
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
  };

  const send = useCallback((query) => {
    const text = (query ?? input).trim();
    if (!text || isThinking || !memoryReady) return;
    setInput(""); setHasStarted(true);
    const userMessage = { role: "user", text };
    setMessages((current) => [...current, userMessage]); saveMessage(userMessage);
    const response = findResponse(text);
    if (response.id === "meaning") setShowSteps(true);
    setIsThinking(true);
    setTimeout(() => {
      const answer = { role: "assistant", title: response.title, text: response.body, source: response.source };
      setMessages((current) => [...current, answer]); saveMessage(answer); setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, thinkDelay(response.body));
  }, [input, isThinking, memoryReady, conversationId]);

  return <div className="app-shell">
    <div className="ambient-glow glow-left" /><div className="ambient-glow glow-right" />
    <header className="topbar">
      <div className="brand-lockup"><div className="brand-mark"><StepsMark size={30} /></div><div><div className="brand-name">Vamanan <span>GPT</span></div><div className="brand-subtitle">A keeper of old stories</div></div></div>
      <div className="topbar-meta"><div className="memory-status"><span className={`status-dot ${memoryReady ? "ready" : ""}`} />{memoryReady ? "Memory is awake" : "Opening the palm-leaf"}</div><div className="onam-chip"><span className="chip-petal" />Kerala · Onam 2026</div></div>
    </header>
    <div className="heritage-ribbon"><span>𑁍</span><span>The story is not behind us. It is waiting to be remembered.</span><span>𑁍</span></div>
    <main ref={scrollRef} className="conversation-scroll scrollbar">
      <div className="conversation-column">
        {!hasStarted && <div className="welcome-panel"><Pookkalam /><div className="welcome-copy"><span className="eyebrow">Ponnonam · The golden Onam</span><h1>Where the smallest<br /><em>step</em> holds the world.</h1><p>Ask about Vamanan, Mahabali, or the old songs of Kerala. This is a space for stories that have travelled through generations.</p><div className="welcome-rule"><span /> <small>ഓണം വരവായി · Onam has returned</small> <span /></div></div></div>}
        {messages.map((message, index) => <Message key={`${message.role}-${index}`} msg={message} />)}
        {isThinking && <TypingDots />}
        {showSteps && <ThreeSteps />}
        {!hasStarted && !isThinking && memoryReady && <div className="starter-area"><div className="starter-heading"><span />Begin with a question<span /></div><div className="starter-grid">{STARTERS.map((starter) => <button key={starter.label} className="starter-card" onClick={() => send(starter.query)}><span>{starter.label}</span><b>↗</b></button>)}</div></div>}
      </div>
    </main>
    <footer className="composer-footer"><div className="composer-wrap"><div className="composer"><textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Ask the keeper a question…" rows={1} /><button className={`send-button ${input.trim() && !isThinking ? "active" : ""}`} onClick={() => send()} disabled={!input.trim() || isThinking || !memoryReady} aria-label="Send question">↗</button></div><button className={`steps-trigger ${showSteps ? "selected" : ""}`} onClick={() => setShowSteps((current) => !current)}><span className="trigger-icon"><StepsMark size={18} /></span>{showSteps ? "Close the three steps" : "Walk the three steps"}</button></div><div className="composer-note">Your conversation is remembered in this browser · Vamanan speaks from tradition, not certainty.</div></footer>
  </div>;
}
