import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import { FiBook, FiHome, FiPlusCircle, FiUsers, FiLogOut, FiMenu, FiX, FiBookOpen } from "react-icons/fi";
import toast from "react-hot-toast";
import { useState } from "react";

export default function AdminSidebar() {
  const { logout, userProfile } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: "/admin",             label: t.admin.dashboard,    icon: FiHome,       end: true },
    { to: "/admin/books",       label: t.admin.manageBooks,  icon: FiBook },
    { to: "/admin/books/add",   label: t.admin.addBook,      icon: FiPlusCircle },
    { to: "/admin/rentals",     label: t.admin.rentals,      icon: FiBookOpen },
    { to: "/admin/users",       label: t.admin.users,        icon: FiUsers },
  ];

  async function handleLogout() {
    try {
      await logout();
      toast.success(t.auth.loggedOut);
      navigate("/");
    } catch {
      toast.error(t.auth.errors.logoutFailed);
    }
  }

  return (
    <aside className={(collapsed ? "w-16" : "w-64") + " shrink-0 min-h-screen bg-gray-900 dark:bg-dark-bg flex flex-col transition-all duration-300"}>
      {/* Header */}
      <div className={"flex items-center " + (collapsed ? "justify-center" : "justify-between") + " px-4 h-16 border-b border-gray-700"}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <FiBook className="text-white" size={16} />
            </div>
            <span className="text-white font-bold text-sm">ReadWorld <span className="text-primary-400">{t.admin.adminRole}</span></span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
          {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
        </button>
      </div>

      {/* Profile */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center font-semibold text-white text-sm shrink-0">
              {(userProfile?.name || t.admin.adminRole)[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{userProfile?.name || t.admin.adminRole}</p>
              <p className="text-xs text-gray-400 truncate">{userProfile?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm font-medium " +
              (isActive ? "bg-primary-600 text-white shadow-sm" : "text-gray-400 hover:text-white hover:bg-gray-700")
            }>
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-700 transition text-sm font-medium">
          <FiLogOut size={18} className="shrink-0" />
          {!collapsed && <span>{t.admin.logout}</span>}
        </button>
      </div>
    </aside>
  );
}
