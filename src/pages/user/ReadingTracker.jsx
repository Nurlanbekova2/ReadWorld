import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import { localizeBook } from "../../utils/localizeBook";
import {
  getUserReadingList, getUserStats, getUserDailyLogs,
  logDailyPages, updateReadingStatus, removeFromReadingList,
  BADGE_DEFS, getLevel,
} from "../../services/readingService";
import Spinner from "../../components/ui/Spinner";
import BookEmojiGame from "../../components/ui/BookEmojiGame";
import {
  FiActivity, FiAlertCircle, FiAward, FiBook, FiBookOpen, FiBookmark,
  FiCalendar, FiCheckCircle, FiClock, FiLock, FiPlus, FiStar,
  FiTrash2, FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";

const STATUS_META = {
  reading: { Icon: FiBookOpen, color: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300" },
  want:    { Icon: FiBookmark, color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" },
  done:    { Icon: FiCheckCircle, color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
};

const BADGE_ICONS = {
  first_page: FiBookOpen,
  week_streak: FiActivity,
  bookworm: FiBook,
  reader_100: FiCheckCircle,
  month_streak: FiAward,
  legend: FiAward,
  night_owl: FiClock,
  consistent: FiZap,
};

// ── Log pages modal ───────────────────────────────────────────────────
function LogModal({ book, onClose, onLog }) {
  const { t } = useLang();
  const copy = t.readingTracker.modal;
  const [pages, setPages] = useState("");
  const [busy,  setBusy]  = useState(false);
  async function submit(e) {
    e.preventDefault();
    const n = Number(pages);
    if (!n || n < 1) { toast.error(copy.invalidPages); return; }
    setBusy(true);
    await onLog(book, n);
    setBusy(false);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-bounce-in">
        <h3 className="font-bold text-gray-800 dark:text-dark-text mb-1 text-lg flex items-center gap-2"><FiBookOpen aria-hidden="true" /> {copy.title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-1">{book?.bookTitle}</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">{copy.pagesLabel}</label>
            <input type="number" min="1" max="9999" value={pages}
              onChange={(e) => setPages(e.target.value)} placeholder={copy.placeholder} autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            {pages > 0 && <p className="text-xs text-primary-600 mt-1.5 font-medium">+{pages * 2} XP {copy.xpPreview}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted text-sm font-medium hover:bg-gray-50 transition">{copy.cancel}</button>
            <button type="submit" disabled={busy} className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition disabled:opacity-50">
              {busy ? copy.saving : copy.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Single book card ──────────────────────────────────────────────────
function BookEntry({ entry, onStatus, onRemove, onLog }) {
  const { lang, t } = useLang();
  const copy = t.readingTracker;
  const meta = STATUS_META[entry.status] || STATUS_META.want;
  const localizedBook = localizeBook({
    title: entry.bookTitle,
    author: entry.bookAuthor,
    translations: entry.translations,
  }, lang, t);
  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="flex gap-3 p-4">
        {entry.imageUrl && !entry.imageUrl.startsWith("data:") ? (
          <img src={entry.imageUrl} alt={entry.bookTitle} className="w-14 h-20 object-cover rounded-xl shrink-0"/>
        ) : (
          <div className="w-14 h-20 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 shrink-0"><FiBookOpen size={24} aria-hidden="true" /></div>
        )}
        <div className="flex-1 min-w-0">
          <Link to={"/books/" + entry.bookId} className="font-semibold text-sm text-gray-900 dark:text-dark-text hover:text-primary-600 transition line-clamp-2 leading-snug block">
            {localizedBook.title}
          </Link>
          {localizedBook.author && <p className="text-xs text-gray-400 mt-0.5 mb-2">{localizedBook.author}</p>}
          <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold " + meta.color}>
            <meta.Icon aria-hidden="true" /> {copy.status[entry.status] || copy.status.want}
          </span>
        </div>
      </div>
      <div className="border-t border-gray-50 dark:border-dark-border px-4 py-2.5 flex flex-wrap items-center gap-2">
        {["reading","want","done"].map((s) => {
          const StatusIcon = STATUS_META[s].Icon;
          return (
            <button key={s} onClick={() => onStatus(entry, s)} title={copy.status[s]}
              className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition " + (entry.status === s ? "bg-primary-600 text-white" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg")}>
              <StatusIcon aria-hidden="true" />
              <span>{copy.status[s]}</span>
            </button>
          );
        })}
        {entry.status === "reading" && (
          <button onClick={() => onLog(entry)} className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 text-xs font-semibold hover:bg-primary-100 transition">
            <FiPlus size={12}/> {copy.logPages}
          </button>
        )}
        <button onClick={() => onRemove(entry)} className={"p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition " + (entry.status === "reading" ? "" : "ml-auto")}>
          <FiTrash2 size={14}/>
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────
export default function ReadingTracker() {
  const { currentUser } = useAuth();
  const { t } = useLang();
  const copy = t.readingTracker;
  const [list,    setList]    = useState([]);
  const [stats,   setStats]   = useState(null);
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tab,     setTab]     = useState("reading");
  const [logBook, setLogBook] = useState(null);
  const [confetti, setConfetti] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  async function reload() {
    if (!currentUser) { setLoading(false); return; }
    setLoading(true);
    setLoadError(null);
    try {
      const [l, s, lg] = await Promise.all([
        getUserReadingList(currentUser.uid),
        getUserStats(currentUser.uid),
        getUserDailyLogs(currentUser.uid),
      ]);
      setList(l);
      setStats(s);
      setLogs(lg);
    } catch(e) {
      console.error("Reading tracker load error:", e.code, e.message);
      setLoadError(e);
      toast.error(
        e.code === "permission-denied"
          ? copy.errors.readPermission
          : copy.errors.load + ": " + e.message
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, [currentUser]);

  async function handleStatus(entry, newStatus) {
    try {
      await updateReadingStatus(currentUser.uid, entry.bookId, newStatus);
      setList(prev => prev.map(e => e.id === entry.id ? { ...e, status: newStatus } : e));
      if (newStatus === "done") {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
        toast.success(copy.notifications.bookDone);
      } else {
        toast.success(copy.notifications.statusUpdated);
      }
    } catch(e) {
      console.error("Reading status update error:", e.code, e.message);
      toast.error(
        e.code === "permission-denied"
          ? copy.errors.writePermission
          : e.message
      );
    }
  }

  async function handleRemove(entry) {
    try {
      await removeFromReadingList(currentUser.uid, entry.bookId);
      setList(prev => prev.filter(e => e.id !== entry.id));
      toast.success(copy.notifications.removed);
    } catch(e) {
      console.error("Reading list remove error:", e.code, e.message);
      toast.error(
        e.code === "permission-denied"
          ? copy.errors.writePermission
          : e.message
      );
    }
  }

  async function handleLog(book, pages) {
    try {
      await logDailyPages({ userId: currentUser.uid, bookId: book.bookId, bookTitle: book.bookTitle, pages });
      toast.success("+" + (pages * 2) + " XP " + copy.notifications.xpAwarded);
      await reload();
    } catch(e) {
      console.error("Daily reading log error:", e.code, e.message);
      toast.error(
        e.code === "permission-denied"
          ? copy.errors.progressPermission
          : e.message
      );
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <FiBookOpen className="text-primary-500" size={64} aria-hidden="true" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">{copy.login.title}</h2>
        <Link to="/login" className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">
          {copy.login.button}
        </Link>
      </div>
    );
  }

  if (loading) return <Spinner fullScreen />;

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
          <FiAlertCircle className="text-amber-500" size={56} aria-hidden="true" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
            {copy.errors.loadTitle}
          </h2>
          <p className="max-w-xl text-sm text-gray-500 dark:text-dark-muted">
            {loadError.code === "permission-denied"
              ? copy.errors.readPermission
              : loadError.message}
          </p>
          <button onClick={reload} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">
            {copy.errors.retry}
          </button>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
          <BookEmojiGame />
        </div>
      </div>
    );
  }

  const level       = getLevel(stats?.xp || 0);
  const todayLogs   = logs.filter(l => l.date === today);
  const todayPages  = todayLogs.reduce((s, l) => s + (l.pages || 0), 0);
  const currentBook = list.find((entry) => entry.status === "reading");
  const filtered    = list.filter(e => e.status === tab);
  const earnedBadges = BADGE_DEFS.filter(b => (stats?.badges || []).includes(b.id));

  const TABS = [
    { key: "reading", Icon: FiBookOpen, label: copy.tabs.reading, count: list.filter(e=>e.status==="reading").length },
    { key: "want",    Icon: FiBookmark, label: copy.tabs.want, count: list.filter(e=>e.status==="want").length },
    { key: "done",    Icon: FiCheckCircle, label: copy.tabs.done, count: list.filter(e=>e.status==="done").length },
    { key: "log",     Icon: FiCalendar, label: copy.tabs.log, count: logs.length },
  ];
  const EmptyTabIcon = tab === "reading" ? FiBookOpen : tab === "want" ? FiBookmark : FiCheckCircle;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({length: 24}).map((_, i) => {
            const CelebrationIcon = [FiAward, FiStar, FiZap, FiBookOpen][i % 4];
            return (
              <CelebrationIcon key={i} className="absolute text-yellow-400 animate-bounce"
                style={{ left: (Math.random()*90)+"%", top: (Math.random()*80)+"%", animationDelay: (Math.random()*0.8)+"s" }} />
            );
          })}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text flex items-center gap-2"><FiBookOpen aria-hidden="true" /> {copy.title}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">{copy.subtitle}</p>
        </div>

        {/* XP & Level card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-primary-200 text-xs font-medium">{copy.level} {level.level}</p>
              <h2 className="text-xl font-bold">{copy.levels[level.level - 1]}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{(stats?.xp || 0).toLocaleString()}</p>
              <p className="text-primary-200 text-xs">XP</p>
            </div>
          </div>
          {/* XP progress bar */}
          <div className="bg-white/20 rounded-full h-2.5 mb-4">
            <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-700"
              style={{ width: level.pct + "%" }}/>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold flex items-center justify-center gap-2"><FiActivity aria-hidden="true" /> {stats?.streak || 0}</p>
              <p className="text-xs text-primary-200">{copy.streak}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold flex items-center justify-center gap-2"><FiBookOpen aria-hidden="true" /> {todayPages}</p>
              <p className="text-xs text-primary-200">{copy.pagesToday}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold flex items-center justify-center gap-2"><FiCheckCircle aria-hidden="true" /> {list.filter(e=>e.status==="done").length}</p>
              <p className="text-xs text-primary-200">{copy.status.done}</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-dark-text mb-3 flex items-center gap-2">
              <FiAward className="text-yellow-500" size={18}/> {copy.myBadges} ({earnedBadges.length})
            </h3>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map((badge) => {
                const BadgeIcon = BADGE_ICONS[badge.id] || FiAward;
                return (
                  <div key={badge.id} title={copy.badges[badge.id]?.desc || badge.desc} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40 hover:scale-110 transition-transform cursor-default">
                    <BadgeIcon className="text-yellow-500" size={24} aria-hidden="true" />
                    <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 text-center leading-tight max-w-[65px]">{copy.badges[badge.id]?.label || badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All badges (locked) */}
        <details className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-sm">
          <summary className="cursor-pointer font-semibold text-gray-700 dark:text-dark-text text-sm select-none">
            <FiAward className="mr-1 inline-block text-yellow-500" aria-hidden="true" /> {copy.allBadges} ({BADGE_DEFS.length})
          </summary>
          <div className="flex flex-wrap gap-2 mt-3">
            {BADGE_DEFS.map((badge) => {
              const earned = (stats?.badges || []).includes(badge.id);
              const BadgeIcon = BADGE_ICONS[badge.id] || FiAward;
              return (
                <div key={badge.id} title={copy.badges[badge.id]?.desc || badge.desc}
                  className={"flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border " + (earned
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/40 text-yellow-700 dark:text-yellow-300"
                    : "bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-dark-border text-gray-400 opacity-50")}>
                  <BadgeIcon aria-hidden="true" />
                  <span>{copy.badges[badge.id]?.label || badge.label}</span>
                  {!earned && <FiLock className="text-gray-300" aria-label="Locked" />}
                </div>
              );
            })}
          </div>
        </details>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-dark-surface rounded-2xl p-1 border border-gray-100 dark:border-dark-border shadow-sm">
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={"flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition " +
                (tab === tb.key ? "bg-primary-600 text-white shadow-sm" : "text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg")}>
              <tb.Icon aria-hidden="true" />
              <span className="hidden sm:inline">{tb.label}</span>
              <span className={"text-xs px-1.5 py-0.5 rounded-full " + (tab===tb.key ? "bg-white/20" : "bg-gray-100 dark:bg-dark-bg")}>{tb.count}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "log" ? (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FiCalendar className="mx-auto mb-3 text-gray-300" size={40} aria-hidden="true" />
                <p className="font-medium">{copy.empty.logTitle}</p>
                <p className="text-xs mt-1">{currentBook ? copy.empty.logInstructions : copy.empty.logDescription}</p>
                {currentBook && (
                  <button
                    onClick={() => setLogBook(currentBook)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <FiPlus size={15} aria-hidden="true" /> {copy.logPages}
                  </button>
                )}
              </div>
            ) : logs.slice(0, 30).map(lg => (
              <div key={lg.id} className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border p-4 shadow-sm flex items-center gap-4">
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + (lg.date === today ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-dark-bg text-gray-400")}>
                  <FiCalendar size={18}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-dark-text text-sm line-clamp-1">{lg.bookTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{lg.date}{lg.date === today ? ` (${copy.today})` : ""}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-800 dark:text-dark-text">{lg.pages} {copy.pageShort}</p>
                  <p className="text-xs text-primary-500 font-medium">+{lg.pages * 2} XP</p>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <EmptyTabIcon className="mx-auto mb-4 text-gray-300" size={40} aria-hidden="true" />
            <p className="text-gray-500 dark:text-dark-muted font-medium mb-1">
              {tab === "reading" ? copy.empty.reading
               : tab === "want" ? copy.empty.want
               : copy.empty.done}
            </p>
            <p className="text-sm text-gray-400 mb-5">{copy.empty.hint}</p>
            <Link to="/books" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition">
              <FiBookOpen size={14}/> {copy.empty.catalog}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(entry => (
              <BookEntry key={entry.id} entry={entry}
                onStatus={handleStatus}
                onRemove={handleRemove}
                onLog={setLogBook}
              />
            ))}
          </div>
        )}

        <BookEmojiGame />
      </div>

      {logBook && (
        <LogModal book={logBook} onClose={() => setLogBook(null)} onLog={handleLog}/>
      )}
    </div>
  );
}