import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { FiBookOpen } from "react-icons/fi";
import { AuthProvider } from "./context/AuthContext";
import { LangProvider, useLang } from "./i18n/index.jsx";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { ProtectedRoute, AdminRoute } from "./components/layout/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import DraggableMascot from "./components/ui/DraggableMascot";

import Home        from "./pages/user/Home";
import Books       from "./pages/user/Books";
import Login       from "./pages/user/Login";
import Register    from "./pages/user/Register";
import BookDetails from "./pages/user/BookDetails";
import Favorites   from "./pages/user/Favorites";
import MyRentals        from "./pages/user/MyRentals";
import ReadingTracker   from "./pages/user/ReadingTracker";
import Profile          from "./pages/user/Profile";

import AdminLogin     from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks     from "./pages/admin/AdminBooks";
import AdminAddBook   from "./pages/admin/AdminAddBook";
import AdminEditBook  from "./pages/admin/AdminEditBook";
import AdminUsers     from "./pages/admin/AdminUsers";
import AdminRentals   from "./pages/admin/AdminRentals";

function UserLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function NotFound() {
  const { t } = useLang();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <FiBookOpen className="mb-4 text-primary-500" size={72} aria-hidden="true" />
      <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-2">{t.notFound.title}</h1>
      <p className="text-gray-500 dark:text-dark-muted mb-6">{t.notFound.description}</p>
      <Link to="/" className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition">{t.notFound.home}</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <Toaster position="top-right"
            toastOptions={{ duration: 3500, style: { borderRadius: "12px", fontSize: "14px", fontWeight: 500 } }} />
          <DraggableMascot />
          <Routes>
            {/* Public */}
            <Route path="/"          element={<UserLayout><Home /></UserLayout>} />
            <Route path="/books"     element={<UserLayout><Books /></UserLayout>} />
            <Route path="/books/:id" element={<UserLayout><BookDetails /></UserLayout>} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />

            {/* Protected user */}
            <Route path="/favorites" element={<ProtectedRoute><UserLayout><Favorites /></UserLayout></ProtectedRoute>} />
            <Route path="/rentals"   element={<ProtectedRoute><UserLayout><MyRentals /></UserLayout></ProtectedRoute>} />
            <Route path="/reading"   element={<ProtectedRoute><UserLayout><ReadingTracker /></UserLayout></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><UserLayout><Profile /></UserLayout></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index                  element={<AdminDashboard />} />
              <Route path="books"           element={<AdminBooks />} />
              <Route path="books/add"       element={<AdminAddBook />} />
              <Route path="books/edit/:id"  element={<AdminEditBook />} />
              <Route path="rentals"         element={<AdminRentals />} />
              <Route path="users"           element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<UserLayout><NotFound /></UserLayout>} />
          </Routes>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
