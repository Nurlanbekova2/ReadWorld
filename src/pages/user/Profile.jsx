import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import { getUserReadingList, getUserStats, getLevel, BADGE_DEFS } from "../../services/readingService";
import { localizeBook } from "../../utils/localizeBook";
import Spinner from "../../components/ui/Spinner";
import {
  FiArrowRight, FiAward, FiBook, FiBookOpen, FiBookmark,
  FiActivity, FiCheckCircle, FiClock, FiUser, FiZap,
} from "react-icons/fi";

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

export default function Profile() {
  const { currentUser, userProfile } = useAuth();
  const { lang, t } = useLang();
  const copy = t.home.readingDashboard;
  const badgeCopy = t.readingTracker.badges;
  const [list, setList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [readingList, userStats] = await Promise.all([
        getUserReadingList(currentUser.uid),
        getUserStats(currentUser.uid),
      ]);
      setList(readingList);
      setStats(userStats);
    } catch (error) {
      console.error("Profile data load error:", error.code, error.message);
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) return <Spinner fullScreen />;

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-gray-600 dark:text-dark-muted">
          {loadError.code === "permission-denied"
            ? t.readingTracker.errors.readPermission
            : `${t.readingTracker.errors.load}: ${loadError.message}`}
        </p>
        <button onClick={loadProfile} className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">
          {t.readingTracker.errors.retry}
        </button>
      </div>
    );
  }

  const level = getLevel(stats?.xp || 0);
  const reading = list.filter((entry) => entry.status === "reading");
  const want = list.filter((entry) => entry.status === "want");
  const done = list.filter((entry) => entry.status === "done");
  const earnedBadges = BADGE_DEFS.filter((badge) => (stats?.badges || []).includes(badge.id));
  const displayName = userProfile?.name || currentUser.displayName || currentUser.email;
  const getBookTitle = (entry) => localizeBook({
    title: entry.bookTitle,
    author: entry.bookAuthor,
    translations: entry.translations,
  }, lang, t).title;
  const groups = [
    {
      key: "reading",
      entries: reading,
      label: copy.reading,
      empty: copy.noActiveBooks,
      icon: FiBookOpen,
      panel: "bg-primary-50 dark:bg-primary-900/20",
      headingStyle: "text-primary-700 dark:text-primary-300",
      count: "bg-primary-600",
      hover: "hover:text-primary-600",
      textHover: "group-hover:text-primary-600",
      fallback: "bg-primary-100 dark:bg-primary-800/40",
      more: "text-primary-500",
    },
    {
      key: "want",
      entries: want,
      label: copy.want,
      empty: copy.emptyList,
      icon: FiBookmark,
      panel: "bg-yellow-50 dark:bg-yellow-900/20",
      headingStyle: "text-yellow-700 dark:text-yellow-300",
      count: "bg-yellow-500",
      hover: "hover:text-yellow-600",
      textHover: "group-hover:text-yellow-600",
      fallback: "bg-yellow-100 dark:bg-yellow-800/40",
      more: "text-yellow-500",
    },
    {
      key: "done",
      entries: done,
      label: copy.done,
      empty: copy.noFinishedBooks,
      icon: FiCheckCircle,
      panel: "bg-green-50 dark:bg-green-900/20",
      headingStyle: "text-green-700 dark:text-green-300",
      count: "bg-green-600",
      hover: "hover:text-green-600",
      textHover: "group-hover:text-green-600",
      fallback: "bg-green-100 dark:bg-green-800/40",
      more: "text-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <header className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
            <FiUser size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.nav.profile}</h1>
            <p className="text-sm text-gray-500 dark:text-dark-muted">{displayName}</p>
          </div>
        </header>

        <section className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-primary-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiBookOpen className="text-white" size={24} />
              <div>
                <p className="font-bold text-white text-sm">{copy.title}</p>
                <p className="text-white/70 text-xs">{copy.levels[level.level - 1]} — {copy.level} {level.level}</p>
              </div>
            </div>
            <Link to="/reading" className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition">
              {t.readingTracker.title} <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500 dark:text-dark-muted font-medium">{level.xp} / {level.max} XP</span>
                <span className="text-xs font-bold text-yellow-600 flex items-center gap-1">
                  <FiZap size={12} /> {(stats?.xp || 0).toLocaleString()} {copy.totalXp}
                </span>
              </div>
              <div className="bg-gray-100 dark:bg-dark-bg rounded-full h-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-700" style={{ width: level.pct + "%" }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                {[
                  { value: stats?.streak || 0, label: copy.streak, Icon: FiActivity },
                  { value: done.length, label: copy.finished, Icon: FiCheckCircle },
                  { value: stats?.xp || 0, label: copy.xpPoints, Icon: FiZap },
                ].map(({ value, label, Icon }) => (
                  <div key={label} className="bg-gray-50 dark:bg-dark-bg rounded-2xl p-3 text-center">
                    <p className="text-xl font-bold text-gray-800 dark:text-dark-text flex items-center justify-center gap-2">
                      <Icon className="text-primary-500" aria-hidden="true" /> {value}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {groups.map(({ key, entries, label, empty, icon: Icon, panel, headingStyle, count, hover, textHover, fallback, more }) => (
                <div key={key} className={`${panel} rounded-2xl p-4`}>
                  <h2 className={`font-bold ${headingStyle} text-sm mb-3 flex items-center gap-1.5`}>
                    <Icon size={16} />
                    {label}
                    <span className={`ml-auto ${count} text-white text-xs px-2 py-0.5 rounded-full`}>{entries.length}</span>
                  </h2>
                  {entries.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">{empty}</p>
                  ) : (
                    <ul className="space-y-2">
                      {entries.slice(0, 3).map((entry) => (
                        <li key={entry.id}>
                          <Link to={"/books/" + entry.bookId} className={`flex items-center gap-2 ${hover} transition group`}>
                            {entry.imageUrl && !entry.imageUrl.startsWith("data:") ? (
                              <img src={entry.imageUrl} alt="" className="w-8 h-10 object-cover rounded-lg shrink-0" />
                            ) : (
                              <div className={`w-8 h-10 rounded-lg ${fallback} flex items-center justify-center shrink-0`}>
                                <FiBook size={15} />
                              </div>
                            )}
                            <span className={`text-xs font-medium text-gray-700 dark:text-dark-text ${textHover} line-clamp-2 leading-snug`}>
                              {getBookTitle(entry)}
                            </span>
                          </Link>
                        </li>
                      ))}
                      {entries.length > 3 && (
                        <li className={`text-xs ${more}`}>+{entries.length - 3} {copy.more}</li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-bold text-gray-700 dark:text-dark-text text-sm mb-3 flex items-center gap-2">
                <FiAward className="text-yellow-500" size={16} /> {t.readingTracker.myBadges} ({earnedBadges.length})
              </h2>
              {earnedBadges.length ? (
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.map((badge) => {
                    const BadgeIcon = BADGE_ICONS[badge.id] || FiAward;
                    return (
                      <div key={badge.id} title={badgeCopy[badge.id].desc} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30">
                        <BadgeIcon className="text-yellow-600" size={16} />
                        <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">{badgeCopy[badge.id].label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{copy.badgesHint}</p>
              )}
            </div>

            {done.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-700 dark:text-dark-text text-sm mb-3 flex items-center gap-2">
                  <FiBook className="text-green-600" size={16} /> {copy.finishedBooks} ({done.length})
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {done.slice(0, 10).map((entry) => (
                    <Link key={entry.id} to={"/books/" + entry.bookId} title={getBookTitle(entry)}>
                      {entry.imageUrl && !entry.imageUrl.startsWith("data:") ? (
                        <img src={entry.imageUrl} alt={getBookTitle(entry)} className="w-12 h-16 object-cover rounded-xl shadow-sm hover:scale-110 transition-transform border-2 border-green-200 dark:border-green-800" />
                      ) : (
                        <div className="w-12 h-16 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 border-2 border-green-200 dark:border-green-800 hover:scale-110 transition-transform">
                          <FiBook size={20} />
                        </div>
                      )}
                    </Link>
                  ))}
                  {done.length > 10 && (
                    <Link to="/reading" className="w-12 h-16 rounded-xl bg-gray-100 dark:bg-dark-bg border-2 border-dashed border-gray-300 dark:border-dark-border flex items-center justify-center text-xs text-gray-400 hover:border-primary-400 transition">
                      +{done.length - 10}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
