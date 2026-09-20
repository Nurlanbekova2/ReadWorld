import { useState } from "react";
import { useForm } from "react-hook-form";
import { borrowBook } from "../../services/rentalService";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import Modal from "./Modal";
import { FiPhone, FiCalendar, FiBook } from "react-icons/fi";
import toast from "react-hot-toast";

export default function RentModal({ isOpen, onClose, book, onSuccess }) {
  const { currentUser, userProfile } = useAuth();
  const { t } = useLang();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);

  // min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function onSubmit({ phone, dueDate }) {
    if (!currentUser) { toast.error(t.bookDetails.loginToBorrow); return; }
    setLoading(true);
    try {
      await borrowBook({
        userId:    currentUser.uid,
        bookId:    book.id,
        bookTitle: book.title,
        userName:  userProfile?.name || currentUser.displayName || "Unknown",
        phone,
        dueDate,
      });
      toast.success(t.bookDetails.borrowSuccess);
      reset();
      onClose();
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.rental.title}>
      <div className="space-y-1 mb-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-800/40 flex items-center justify-center shrink-0">
            <FiBook className="text-primary-600 dark:text-primary-300" size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-gray-800 dark:text-dark-text text-sm line-clamp-1">{book?.title}</p>
            <p className="text-xs text-gray-500 dark:text-dark-muted">{book?.author}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-dark-muted pt-1">{t.rental.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
            <FiPhone className="inline mr-1.5" size={13} />
            {t.rental.yourPhone}
          </label>
          <input
            type="tel"
            placeholder={t.rental.phonePlaceholder}
            className={"w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text transition " +
              (errors.phone ? "border-red-400" : "border-gray-200 dark:border-dark-border")}
            {...register("phone", {
              required: t.rental.errors.phoneRequired,
              pattern:  { value: /^[+\d\s\-()]{7,20}$/, message: t.rental.errors.phoneRequired },
            })}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>

        {/* Due date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
            <FiCalendar className="inline mr-1.5" size={13} />
            {t.rental.dueDate}
          </label>
          <input
            type="date"
            min={minDate}
            className={"w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text transition " +
              (errors.dueDate ? "border-red-400" : "border-gray-200 dark:border-dark-border")}
            {...register("dueDate", {
              required: t.rental.errors.dueDateRequired,
              min:      { value: minDate, message: t.rental.errors.dueDateMin },
            })}
          />
          <p className="text-xs text-gray-400 mt-1">{t.rental.dueDateHint}</p>
          {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition text-sm font-medium">
            {t.cancel}
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition text-sm disabled:opacity-60 shadow-sm">
            {loading ? t.rental.borrowing : t.rental.borrowBtn}
          </button>
        </div>
      </form>
    </Modal>
  );
}
