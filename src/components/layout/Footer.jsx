import { Link } from "react-router-dom";
import { useLang } from "../../i18n/index.jsx";
import { FiBook, FiGithub, FiTwitter, FiInstagram } from "react-icons/fi";

export default function Footer() {
  const { t } = useLang();

  const footerLinks = [
    { to: "/",          label: t.footer.links.home },
    { to: "/books",     label: t.footer.links.browse },
    { to: "/favorites", label: t.footer.links.favorites },
    { to: "/login",     label: t.footer.links.login },
    { to: "/register",  label: t.footer.links.register },
  ];

  const categories = [
    t.home.categories.fiction,
    t.home.categories.nonFiction,
    t.home.categories.science,
    t.home.categories.technology,
    t.home.categories.history,
    t.home.categories.biography,
  ];

  return (
    <footer className="bg-gray-900 dark:bg-dark-bg text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <FiBook className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl text-white">
                Read<span className="text-primary-400">World</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">{t.footer.tagline}</p>
            <div className="flex items-center gap-3 mt-4">
              {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-gray-800 hover:bg-primary-700 transition">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-3">{t.footer.explore}</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-primary-400 transition">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-3">{t.footer.categories}</h4>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link to={`/books?category=${cat}`} className="hover:text-primary-400 transition">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ReadWorld. {t.footer.rights}</p>
          <p>{t.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}