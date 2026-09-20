import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addBook } from "../../services/bookService";
import { useLang } from "../../i18n/index.jsx";
import BookForm from "../../components/admin/BookForm";
import { FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminAddBook() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data) {
    setLoading(true);
    try {
      await addBook(data);
      toast.success(t.bookForm.addSuccess);
      navigate("/admin/books");
    } catch {
      toast.error(t.bookForm.addFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg transition">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{t.bookForm.addTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{t.bookForm.addDesc}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm p-6 md:p-8">
        <BookForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}