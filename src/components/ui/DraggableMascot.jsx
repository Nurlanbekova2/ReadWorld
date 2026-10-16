import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserStats } from "../../services/readingService";
import { getAllBooks } from "../../services/bookService";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/index.jsx";
import { answerReadingAssistant } from "../../utils/readingAssistant";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";

// ── Bunny SVG ──────────────────────────────────────────────────────────
function Bunny({ mood, size = 90 }) {
  const colors = {
    body:  "#f8f8f8",
    inner: "#ffcdd2",
    nose:  "#f48fb1",
    cheek: "#fca5a5",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <ellipse cx="38" cy="28" rx="11" ry="28" fill={colors.body}/>
      <ellipse cx="38" cy="28" rx="6"  ry="22" fill={colors.inner} opacity="0.8"/>
      <ellipse cx="82" cy="28" rx="11" ry="28" fill={colors.body}/>
      <ellipse cx="82" cy="28" rx="6"  ry="22" fill={colors.inner} opacity="0.8"/>
      {/* Body */}
      <ellipse cx="60" cy="98" rx="30" ry="26" fill={colors.body}/>
      <ellipse cx="60" cy="102" rx="18" ry="14" fill="white" opacity="0.7"/>
      {/* Tail */}
      <circle cx="90" cy="110" r="8" fill="white"/>
      {/* Head */}
      <circle cx="60" cy="62" r="30" fill={colors.body}/>
      {/* Cheeks */}
      <ellipse cx="42" cy="70" rx="8" ry="5" fill={colors.cheek} opacity="0.5"/>
      <ellipse cx="78" cy="70" rx="8" ry="5" fill={colors.cheek} opacity="0.5"/>
      {/* Muzzle */}
      <ellipse cx="60" cy="71" rx="10" ry="7" fill="white" opacity="0.9"/>
      {/* Nose */}
      <ellipse cx="60" cy="67" rx="3.5" ry="2.5" fill={colors.nose}/>
      {/* Whiskers */}
      <line x1="36" y1="68" x2="50" y2="70" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="36" y1="72" x2="50" y2="72" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="84" y1="68" x2="70" y2="70" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="84" y1="72" x2="70" y2="72" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Mouth */}
      {mood === "sad" ? (
        <path d="M 54 75 Q 60 71 66 75" stroke="#d1a1b0" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      ) : mood === "celebrating" ? (
        <path d="M 52 74 Q 60 82 68 74" stroke="#d1a1b0" strokeWidth="2" fill={colors.inner} strokeLinecap="round"/>
      ) : (
        <path d="M 54 74 Q 60 79 66 74" stroke="#d1a1b0" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      )}
      {/* Eyes */}
      {mood === "sad" ? (
        <g>
          <ellipse cx="48" cy="58" rx="5" ry="5" fill="#7986cb"/>
          <ellipse cx="72" cy="58" rx="5" ry="5" fill="#7986cb"/>
          <ellipse cx="49" cy="59" rx="2" ry="2" fill="white"/>
          <ellipse cx="73" cy="59" rx="2" ry="2" fill="white"/>
          <path d="M 42 51 Q 48 47 54 51" stroke="#b0bec5" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M 66 51 Q 72 47 78 51" stroke="#b0bec5" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <ellipse cx="44" cy="65" rx="2.5" ry="4" fill="#90caf9" opacity="0.7"/>
          <ellipse cx="76" cy="65" rx="2.5" ry="4" fill="#90caf9" opacity="0.7"/>
        </g>
      ) : mood === "reading" ? (
        <g>
          <ellipse cx="48" cy="59" rx="5" ry="3.5" fill="#5c6bc0"/>
          <ellipse cx="72" cy="59" rx="5" ry="3.5" fill="#5c6bc0"/>
          <circle cx="48" cy="59" r="8" stroke="#9575cd" strokeWidth="2" fill="none"/>
          <circle cx="72" cy="59" r="8" stroke="#9575cd" strokeWidth="2" fill="none"/>
          <line x1="56" y1="59" x2="64" y2="59" stroke="#9575cd" strokeWidth="2"/>
        </g>
      ) : mood === "celebrating" ? (
        <g>
          <text x="41" y="64" fontSize="12" textAnchor="middle">⭐</text>
          <text x="79" y="64" fontSize="12" textAnchor="middle">⭐</text>
          <polygon points="60,20 50,42 70,42" fill="#f06292"/>
          <circle cx="60" cy="19" r="4" fill="#ffee58"/>
          <path d="M 20 35 Q 30 42 25 52" stroke="#f48fb1" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 100 35 Q 90 42 95 52" stroke="#81d4fa" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
      ) : (
        <g>
          <ellipse cx="48" cy="58" rx="5.5" ry="6" fill="#5c6bc0"/>
          <ellipse cx="72" cy="58" rx="5.5" ry="6" fill="#5c6bc0"/>
          <ellipse cx="49" cy="57" rx="2" ry="2.5" fill="white"/>
          <ellipse cx="73" cy="57" rx="2" ry="2.5" fill="white"/>
          <path d="M 42 50 Q 48 46 54 50" stroke="#b0bec5" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M 66 50 Q 72 46 78 50" stroke="#b0bec5" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>
      )}
      {/* Paws */}
      <ellipse cx="38" cy="112" rx="10" ry="7" fill={colors.body}/>
      <ellipse cx="82" cy="112" rx="10" ry="7" fill={colors.body}/>
      {mood === "reading" && (
        <g>
          <rect x="26" y="105" width="28" height="20" rx="2" fill="#7986cb"/>
          <rect x="27" y="106" width="13" height="18" rx="1" fill="#9fa8da"/>
          <rect x="40" y="106" width="13" height="18" rx="1" fill="#5c6bc0"/>
          <line x1="39.5" y1="106" x2="39.5" y2="124" stroke="white" strokeWidth="1"/>
        </g>
      )}
    </svg>
  );
}

export default function DraggableMascot() {
  const { currentUser } = useAuth();
  const { lang, t } = useLang();
  const [pos,       setPos]       = useState({ x: window.innerWidth - 130, y: window.innerHeight - 170 });
  const [dragging,  setDragging]  = useState(false);
  const [mood,      setMood]      = useState("happy");
  const [speech,    setSpeech]    = useState("");
  const [showSpeech,setShowSpeech]= useState(false);
  const [stats,     setStats]     = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: t.mascot.assistant.greeting },
  ]);
  const [catalog, setCatalog] = useState(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const offset    = useRef({ x: 0, y: 0 });
  const speechRef = useRef();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!chatOpen || catalog !== null || catalogLoading || catalogError) return;
    setCatalogLoading(true);
    getAllBooks()
      .then(setCatalog)
      .catch((error) => {
        console.error("Reading assistant catalog load error:", error);
        setCatalogError(true);
      })
      .finally(() => setCatalogLoading(false));
  }, [chatOpen, catalog, catalogLoading, catalogError]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, catalogLoading]);

  useEffect(() => {
    if (!currentUser) { setMood("happy"); return; }
    getUserStats(currentUser.uid).then((s) => {
      setStats(s);
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      const last = s?.lastLogDate || "";
      if (s?.streak >= 7) {
        setMood("celebrating");
        say(t.mascot.streak.replace("{days}", s.streak));
      }
      else if (last === today) { setMood("reading"); }
      else if (!last || last < yStr) { setMood("sad"); say(t.mascot.missedToday); }
      else { setMood("happy"); }
    }).catch(() => setMood("happy"));
  }, [currentUser, t.mascot]);

  useEffect(() => {
    if (!currentUser) {
      setStats(null);
      return;
    }

    function refreshStats(event) {
      if (event.detail?.userId !== currentUser.uid) return;
      getUserStats(currentUser.uid)
        .then(setStats)
        .catch((error) => {
          console.error("Mascot reading stats refresh error:", error);
        });
    }

    window.addEventListener("readworld:reading-stats-updated", refreshStats);
    return () => window.removeEventListener("readworld:reading-stats-updated", refreshStats);
  }, [currentUser]);

  function say(msg) {
    setSpeech(msg); setShowSpeech(true);
    clearTimeout(speechRef.current);
    speechRef.current = setTimeout(() => setShowSpeech(false), 4500);
  }

  const onMouseDown = useCallback((e) => {
    if (e.target.closest("button, a, input, form")) return;
    e.preventDefault(); setDragging(true);
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth  - 110, e.clientX - offset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 130, e.clientY - offset.current.y)),
    });
  }, [dragging]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  const onTouchStart = useCallback((e) => {
    if (e.target.closest("button, a, input, form")) return;
    const t = e.touches[0];
    offset.current = { x: t.clientX - pos.x, y: t.clientY - pos.y };
  }, [pos]);

  const onTouchMove = useCallback((e) => {
    if (e.target.closest("button, a, input, form")) return;
    e.preventDefault();
    const t = e.touches[0];
    setPos({
      x: Math.max(0, Math.min(window.innerWidth  - 110, t.clientX - offset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 130, t.clientY - offset.current.y)),
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Idle messages every 45 seconds
  useEffect(() => {
    if (!currentUser) return;
    const msgs = [
      ...t.mascot.idle,
      stats?.streak > 0
        ? t.mascot.streakDays.replace("{days}", stats.streak)
        : t.mascot.startStreak,
    ];
    const id = setInterval(() => {
      say(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 45000);
    return () => clearInterval(id);
  }, [currentUser, stats, t.mascot]);

  function sendMessage(message = chatInput, action) {
    const text = message.trim();
    if (!text || catalogLoading) return;

    setChatInput("");
    setChatMessages((previous) => [...previous, { role: "user", text }]);
    if (catalogError || !catalog) {
      setChatMessages((previous) => [
        ...previous,
        { role: "assistant", text: t.mascot.assistant.loadError },
      ]);
      return;
    }

    let answer;
    try {
      answer = answerReadingAssistant(text, catalog, lang, t, action);
    } catch (error) {
      console.error("Reading assistant reply error:", error);
      answer = { text: t.mascot.assistant.help };
    }
    setChatMessages((previous) => [...previous, { role: "assistant", ...answer }]);
  }

  if (minimized) return (
    <div style={{ position:"fixed", left:pos.x, top:pos.y, zIndex:9999, cursor:"grab" }}
      onMouseDown={onMouseDown} onTouchStart={onTouchStart} onTouchMove={onTouchMove}
    >
      <button onClick={(e) => { e.stopPropagation(); setMinimized(false); }}
        style={{ width:"46px", height:"46px", borderRadius:"50%", background:"linear-gradient(135deg,#fce4ec,#f8bbd0)", border:"2px solid white", boxShadow:"0 4px 12px rgba(0,0,0,0.2)", fontSize:"22px", cursor:"pointer" }}
      >🐰</button>
    </div>
  );

  const leftSide = pos.x < window.innerWidth / 2;

  return (
    <>
    <div
      style={{ position:"fixed", left:pos.x, top:pos.y, zIndex:9999, userSelect:"none",
        cursor: dragging ? "grabbing" : "grab",
        filter: dragging ? "drop-shadow(0 10px 20px rgba(0,0,0,0.25))" : "drop-shadow(0 4px 10px rgba(0,0,0,0.15))",
        transition: dragging ? "none" : "filter 0.2s",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => {}}
    >
      {/* Speech bubble */}
      {showSpeech && (
        <div style={{
          position:"absolute", bottom:"102%",
          [leftSide ? "left" : "right"]: 0,
          background:"white", color:"#1e293b",
          fontSize:"12px", fontWeight:"500",
          padding:"8px 12px", borderRadius:"14px",
          boxShadow:"0 4px 16px rgba(0,0,0,0.15)",
          whiteSpace:"nowrap", maxWidth:"190px",
          pointerEvents:"none", marginBottom:"6px",
          border:"1px solid #f1f5f9",
        }}>
          {speech}
        </div>
      )}

      {/* XP badge */}
      {stats && (
        <Link to="/reading" onClick={(e) => e.stopPropagation()}
          style={{ position:"absolute", top:"-10px", right:"-10px",
            background:"linear-gradient(135deg,#f59e0b,#d97706)",
            color:"white", fontSize:"10px", fontWeight:"700",
            padding:"3px 8px", borderRadius:"999px",
            boxShadow:"0 2px 8px rgba(0,0,0,0.2)",
            whiteSpace:"nowrap", textDecoration:"none", zIndex:10001,
          }}
        >
          ⚡{(stats.xp||0)} XP
        </Link>
      )}

      {/* Bunny */}
      <div className={mood==="celebrating" ? "animate-bounce" : ""} style={{position:"relative"}}>
        <Bunny mood={mood} size={95}/>
        {/* Buttons under bunny */}
        <div style={{ position:"absolute", bottom:"-4px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"4px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setChatOpen(true);
              setShowSpeech(false);
            }}
            aria-label={t.mascot.assistant.title}
            title={t.mascot.assistant.title}
            style={{ background:"white", border:"1px solid #f1f5f9", borderRadius:"50%", width:"30px", height:"30px", display:"flex", alignItems:"center", justifyContent:"center", color:"#7c3aed", cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.12)" }}
          ><FiMessageCircle size={15} /></button>
          <button
            onClick={(e) => { e.stopPropagation(); setChatOpen(false); setMinimized(true); }}
            style={{ background:"white", border:"1px solid #f1f5f9", borderRadius:"50%", width:"26px", height:"26px", fontSize:"11px", fontWeight:"bold", color:"#94a3b8", cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.12)" }}
          >_</button>
        </div>
      </div>
    </div>
    {chatOpen && (
      <section
        role="dialog"
        aria-label={t.mascot.assistant.title}
        className="fixed right-4 bottom-24 z-[10000] flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-dark-border dark:bg-dark-surface"
        style={{ height: "min(480px, 70vh)" }}
      >
        <header className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-primary-600 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <FiMessageCircle aria-hidden="true" />
            <h2 className="text-sm font-bold">{t.mascot.assistant.title}</h2>
          </div>
          <button onClick={() => setChatOpen(false)} aria-label={t.cancel} className="rounded-lg p-1 hover:bg-white/20">
            <FiX size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
          {chatMessages.map((message, index) => (
            <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
                message.role === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-800 dark:bg-dark-bg dark:text-dark-text"
              }`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.books?.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {message.books.map((book) => (
                      <li key={book.id}>
                        <Link
                          to={`/books/${book.id}`}
                          onClick={() => setChatOpen(false)}
                          className="block rounded-lg bg-white px-2.5 py-2 font-medium text-primary-700 hover:bg-primary-50 dark:bg-dark-surface dark:text-primary-300"
                        >
                          {book.displayTitle || book.title}
                          {book.displayAuthor || book.author ? <span className="block text-xs font-normal text-gray-500 dark:text-dark-muted">{book.displayAuthor || book.author}</span> : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {message.link && (
                  <Link
                    to={message.link.to}
                    onClick={() => setChatOpen(false)}
                    className="mt-2 inline-block font-semibold text-primary-600 underline dark:text-primary-300"
                  >
                    {message.link.label}
                  </Link>
                )}
              </div>
            </div>
          ))}

          {catalogLoading && <p className="text-xs text-gray-500 dark:text-dark-muted">{t.mascot.assistant.loading}</p>}
          {catalogError && (
            <button onClick={() => { setCatalogError(false); }} className="text-left text-sm font-medium text-red-500 underline">
              {t.readingTracker.errors.retry}
            </button>
          )}
          {chatMessages.at(-1)?.role === "assistant" && !catalogLoading && !catalogError && (
            <div className="flex flex-wrap gap-2">
              {[
                ["find", t.mascot.assistant.findPrompt],
                ["recommend", t.mascot.assistant.recommendPrompt],
                ["reading", t.mascot.assistant.readingPrompt],
                ["genres", t.mascot.assistant.genresPrompt],
                ["favorites", t.mascot.assistant.favoritesPrompt],
                ["rentals", t.mascot.assistant.rentalsPrompt],
              ].map(([action, label]) => (
                <button
                  key={action}
                  disabled={catalogLoading || catalog === null}
                  onClick={() => sendMessage(label, action)}
                  className="rounded-full border border-primary-200 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50 disabled:opacity-50 dark:border-primary-800 dark:text-primary-300 dark:hover:bg-primary-900/20"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={(event) => { event.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2 border-t border-gray-100 p-3 dark:border-dark-border"
        >
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder={t.mascot.assistant.placeholder}
            aria-label={t.mascot.assistant.placeholder}
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-400 dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || catalogLoading || catalog === null}
            aria-label={t.mascot.assistant.send}
            className="rounded-xl bg-primary-600 p-2.5 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <FiSend size={16} />
          </button>
        </form>
      </section>
    )}
    </>
  );
}