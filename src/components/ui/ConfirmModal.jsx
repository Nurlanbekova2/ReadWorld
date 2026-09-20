import Modal from "./Modal";
import { useLang } from "../../i18n/index.jsx";
import { FiTrash2 } from "react-icons/fi";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  const { t } = useLang();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || t.confirm}>
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <FiTrash2 className="text-red-500" size={28} />
        </div>
        <p className="text-gray-600 dark:text-dark-muted text-sm">{message || t.noResults}</p>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border transition font-medium">
            {t.cancel}
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition font-medium">
            {t.delete}
          </button>
        </div>
      </div>
    </Modal>
  );
}