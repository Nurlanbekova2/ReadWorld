import { useEffect, useState } from "react";
import { useLang } from "../../i18n/index.jsx";
import { FiSun, FiMoon } from "react-icons/fi";

const LANGS = [
  { code: "ky", label: "KY", flag: "🇰🇬" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "en", label: "EN", flag: "🇬🇧" },
];

export default function LangAndTheme({ compact = false }) {
  const { lang, changeLang } = useLang();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-dark-bg rounded-xl p-1">
      {/* Language buttons */}
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => changeLang(l.code)}
          title={l.label}
          className={
            "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 " +
            (lang === l.code
              ? "bg-primary-600 text-white shadow-sm scale-105"
              : "text-gray-500 dark:text-dark-muted hover:bg-white dark:hover:bg-dark-surface hover:text-gray-700 dark:hover:text-dark-text")
          }
        >
          <span>{l.flag}</span>
          {!compact && <span>{l.label}</span>}
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-1" />

      {/* Theme toggle */}
      <button
        onClick={() => setDark(!dark)}
        title={dark ? "Light mode" : "Dark mode"}
        className={
          "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 " +
          (dark
            ? "bg-gray-700 text-yellow-400 shadow-sm"
            : "bg-white text-gray-600 shadow-sm hover:text-gray-800")
        }
      >
        {dark ? <FiSun size={14} /> : <FiMoon size={14} />}
        {!compact && <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>}
      </button>
    </div>
  );
}
