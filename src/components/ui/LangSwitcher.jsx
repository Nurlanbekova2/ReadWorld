import { useEffect, useState } from "react";
import { useLang } from "../../i18n/index.jsx";
import { FiChevronDown, FiSun, FiMoon } from "react-icons/fi";

const LANGS = [
  { code: "ky", label: "Кыргызча" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
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
      <label className="relative flex items-center">
        <span className="sr-only">Language</span>
        <select
          value={lang}
          onChange={(event) => changeLang(event.target.value)}
          className="appearance-none cursor-pointer bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text rounded-lg py-1.5 pl-2.5 pr-7 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          {LANGS.map((language) => (
            <option key={language.code} value={language.code}>{language.label}</option>
          ))}
        </select>
        <FiChevronDown className="absolute right-2 pointer-events-none text-gray-500 dark:text-dark-muted" size={13} />
      </label>

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
