import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import LangAndTheme from "../ui/LangSwitcher";
import { FiBook, FiHeart, FiUser, FiLogOut, FiMenu, FiX, FiSearch, FiBookOpen, FiPlayCircle, FiTool } from "react-icons/fi";
import toast from "react-hot-toast";

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function handleLogout() {
    try {
      await logout();
      toast.success(t.auth.loggedOut);
      navigate("/");
    } catch {
      toast.error(t.auth.errors.logoutFailed);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/books?search=" + encodeURIComponent(searchQuery.trim()));
      setMenuOpen(false);
    }
  }

  const navLinks = [
    { to: "/",      label: t.nav.home },
    { to: "/books", label: t.nav.browse },
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-dark-surface/95 backdrop-blur shadow-sm border-b border-gray-100 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <FiBook className="text-white" size={20} />
            </div>
            <span className="hidden sm:block font-bold text-xl text-gray-900 dark:text-dark-text tracking-tight">
              Read<span className="text-primary-600">World</span>
            </span>
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to}
                className={"px-3 py-2 rounded-lg text-sm font-medium transition " +
                  (isActive(l.to)
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-gray-600 dark:text-dark-muted hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-bg")}>
                {l.label}
              </Link>
            ))}

            {currentUser ? (
              <>
                <Link to="/favorites" title={t.nav.favorites}
                  className="p-2 rounded-lg text-gray-500 dark:text-dark-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <FiHeart size={18} />
                </Link>
                <Link to="/rentals" title={t.nav.rentals}
                  className="p-2 rounded-lg text-gray-500 dark:text-dark-muted hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition">
                  <FiBookOpen size={18} />
                </Link>
                <Link to="/reading" title={t.nav.reading}
                  className="p-2 rounded-lg text-gray-500 dark:text-dark-muted hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                  <FiPlayCircle size={18} />
                </Link>
                {isAdmin && (
                  <Link to="/admin"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition">
                    {t.nav.admin}
                  </Link>
                )}
                <Link to="/profile"
                  className="p-2 rounded-lg text-gray-500 dark:text-dark-muted hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition">
                  <FiUser size={18} />
                </Link>
                <button onClick={handleLogout}
                  className="p-2 rounded-lg text-gray-500 dark:text-dark-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-dark-text hover:text-primary-600 transition">
                  {t.nav.login}
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition shadow-sm">
                  {t.nav.signup}
                </Link>
              </>
            )}

            {/* ── Language + Theme block (together) ── */}
            <div className="ml-2">
              <LangAndTheme />
            </div>
          </div>

          {/* Mobile: lang+theme always visible + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LangAndTheme compact />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-gray-500 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-bg transition">
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-surface animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.nav.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none"
                />
              </div>
              <button type="submit"
                className="px-3 py-2 bg-primary-600 text-white rounded-xl text-sm">
                {t.nav.go}
              </button>
            </form>

            {/* Nav links */}
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg">
                {l.label}
              </Link>
            ))}

            {currentUser ? (
              <>
                <Link to="/favorites" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg">
                  <FiHeart className="mr-2 inline-block" aria-hidden="true" /> {t.nav.favorites}
                </Link>
                <Link to="/rentals" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg">
                  <FiBookOpen className="mr-2 inline-block" aria-hidden="true" /> {t.nav.rentals}
                </Link>
                <Link to="/reading" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg">
                  <FiPlayCircle className="mr-2 inline-block" aria-hidden="true" /> {t.nav.reading}
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-primary-600">
                    <FiTool className="mr-2 inline-block" aria-hidden="true" /> {t.nav.admin}
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-dark-text">
                  {t.nav.login}
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-600">
                  {t.nav.signup}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
