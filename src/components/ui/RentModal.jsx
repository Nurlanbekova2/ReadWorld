import { useState } from "react";
import { useForm } from "react-hook-form";
import { borrowBook } from "../../services/rentalService";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../i18n/index.jsx";
import Modal from "./Modal";
import { FiCalendar, FiBook, FiChevronDown } from "react-icons/fi";
import toast from "react-hot-toast";
import { localizeBook } from "../../utils/localizeBook";

// Phone region codes
const REGIONS = [
  { code: "KG", flag: "🇰🇬", dial: "+996", mask: "XXX XXX XXX",  len: 9  },
  { code: "RU", flag: "🇷🇺", dial: "+7",   mask: "XXX XXX XXXX", len: 10 },
  { code: "KZ", flag: "🇰🇿", dial: "+7",   mask: "XXX XXX XXXX", len: 10 },
  { code: "UZ", flag: "🇺🇿", dial: "+998", mask: "XX XXX XXXX",  len: 9  },
  { code: "US", flag: "🇺🇸", dial: "+1",   mask: "XXX XXX XXXX", len: 10 },
  { code: "DE", flag: "🇩🇪", dial: "+49",  mask: "XXX XXXXXXX",  len: 10 },
  { code: "TR", flag: "🇹🇷", dial: "+90",  mask: "XXX XXX XXXX", len: 10 },
  { code: "CN", flag: "🇨🇳", dial: "+86",  mask: "XXX XXXX XXXX",len: 11 },
  { code: "GB", flag: "🇬🇧", dial: "+44",  mask: "XXXX XXXXXX",  len: 10 },
  { code: "AE", flag: "🇦🇪", dial: "+971", mask: "XX XXX XXXX",  len: 9  },
  { code: "TJ", flag: "🇹🇯", dial: "+992", mask: "XX XXX XXXX",  len: 9  },
  { code: "TM", flag: "🇹🇲", dial: "+993", mask: "XX XXXXXX",     len: 8  },
];

export default function RentModal({ isOpen, onClose, book, onSuccess }) {
  const { currentUser, userProfile } = useAuth();
  const { lang, t } = useLang();
  const localizedBook = localizeBook(book, lang, t);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } =
    useForm({ defaultValues: { phone: "" } });
  const [loading, setLoading]         = useState(false);
  const [region, setRegion]           = useState(REGIONS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localPhone, setLocalPhone]   = useState("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  function selectRegion(r) {
    setRegion(r);
    setDropdownOpen(false);
    setLocalPhone("");
    setValue("phone", "");
  }

  function handlePhoneInput(e) {
    // Allow only digits and spaces
    let val = e.target.value.replace(/[^\d]/g, "").slice(0, region.len);
    setLocalPhone(val);
    setValue("phone", region.dial + val, { shouldValidate: true });
  }

  // Format local number visually
  function formatDisplay(digits) {
    if (!digits) return "";
    const mask = region.mask;
    let result = "";
    let di = 0;
    for (let i = 0; i < mask.length && di < digits.length; i++) {
      if (mask[i] === "X") { result += digits[di++]; }
      else { if (di > 0) result += mask[i]; }
    }
    return result;
  }

  async function onSubmit({ dueDate }) {
    if (!currentUser) { toast.error(t.bookDetails.loginToBorrow); return; }
    if (!localPhone || localPhone.length < region.len) {
      toast.error(t.rental.errors.phoneRequired);
      return;
    }
    const fullPhone = region.dial + " " + formatDisplay(localPhone);
    setLoading(true);
    try {
      await borrowBook({
        userId:    currentUser.uid,
        bookId:    book.id,
        bookTitle: book.title,
        userName:  userProfile?.name || currentUser.displayName || "Unknown",
        phone:     fullPhone,
        dueDate,
      });
      toast.success(t.bookDetails.borrowSuccess);
      reset();
      setLocalPhone("");
      setRegion(REGIONS[0]);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to borrow book", err);
      toast.error(t.rental.errors.borrowFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.rental.title}>
      {/* Book info */}
      <div className="mb-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-800/40 flex items-center justify-center shrink-0">
            <FiBook className="text-primary-600 dark:text-primary-300" size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-gray-800 dark:text-dark-text text-sm line-clamp-1">{localizedBook.title}</p>
            <p className="text-xs text-gray-500 dark:text-dark-muted">{localizedBook.author}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{t.rental.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone with region selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
            {t.rental.yourPhone}
          </label>

          <div className="flex gap-2 items-start">
            {/* Region dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 h-12 px-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm font-medium text-gray-700 dark:text-dark-text hover:border-primary-400 transition whitespace-nowrap"
              >
                <span className="text-lg">{region.flag}</span>
                <span className="text-gray-600 dark:text-dark-muted font-mono">{region.dial}</span>
                <FiChevronDown size={14} className={"text-gray-400 transition-transform " + (dropdownOpen ? "rotate-180" : "")} />
              </button>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div className="absolute top-14 left-0 z-50 w-64 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                  <div className="max-h-60 overflow-y-auto">
                    {REGIONS.map((r) => (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() => selectRegion(r)}
                        className={"w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-left " +
                          (region.code === r.code
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium"
                            : "text-gray-700 dark:text-dark-text")}
                      >
                        <span className="text-xl">{r.flag}</span>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate">{t.rental.regions[r.code]}</p>
                        </div>
                        <span className="font-mono text-gray-400 shrink-0">{r.dial}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Phone number input */}
            <div className="flex-1">
              <input
                type="tel"
                inputMode="numeric"
                value={formatDisplay(localPhone)}
                onChange={handlePhoneInput}
                placeholder={region.mask.replace(/X/g, "0")}
                className={"w-full h-12 px-4 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-400 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-dark-text transition " +
                  (errors.phone ? "border-red-400" : "border-gray-200 dark:border-dark-border")}
              />
              {/* Hidden field for validation */}
              <input type="hidden" {...register("phone")} />
            </div>
          </div>

          {/* Preview of full number */}
          {localPhone.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-1.5 ml-1">
              {region.flag} {region.dial} {formatDisplay(localPhone)}
            </p>
          )}
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
              min: { value: minDate, message: t.rental.errors.dueDateMin },
            })}
          />
          <p className="text-xs text-gray-400 mt-1">{t.rental.dueDateHint}</p>
          {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition text-sm font-medium"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition text-sm disabled:opacity-60 shadow-sm"
          >
            {loading ? t.rental.borrowing : t.rental.borrowBtn}
          </button>
        </div>
      </form>
    </Modal>
  );
}
