import { useEffect, useState } from "react";
import { getAllUsers } from "../../services/userService";
import { useLang } from "../../i18n/index.jsx";
import Spinner from "../../components/ui/Spinner";
import { format } from "date-fns";
import { FiUsers, FiShield, FiUser } from "react-icons/fi";

export default function AdminUsers() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.adminUsers.title}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">{users.length} {t.adminUsers.total}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-4 mb-5 shadow-sm">
        <input type="text" placeholder={t.adminUsers.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase text-gray-400 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <th className="px-6 py-3.5 text-left">{t.adminUsers.columns.user}</th>
                <th className="px-6 py-3.5 text-left">{t.adminUsers.columns.email}</th>
                <th className="px-6 py-3.5 text-left">{t.adminUsers.columns.role}</th>
                <th className="px-6 py-3.5 text-left">{t.adminUsers.columns.joined}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-semibold text-primary-600 dark:text-primary-300 text-sm shrink-0">
                        {(user.name || user.email || "?")[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-dark-text">{user.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-dark-muted">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                        : "bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-muted"
                    }`}>
                      {user.role === "admin" ? <FiShield size={11} /> : <FiUser size={11} />}
                      {user.role || "user"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {user.createdAt ? format(new Date(user.createdAt.seconds * 1000), "MMM d, yyyy") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <FiUsers size={36} className="mx-auto mb-3 opacity-30" />
              <p>{t.adminUsers.noUsers}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}