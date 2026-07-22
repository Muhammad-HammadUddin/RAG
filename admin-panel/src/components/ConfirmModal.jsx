import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-ink-800 border border-ink-600 rounded-xl shadow-panel w-full max-w-sm p-6">
        <div className="w-10 h-10 rounded-full bg-rose-soft border border-rose/30 flex items-center justify-center mb-4">
          <AlertTriangle size={18} className="text-rose" />
        </div>
        <h3 className="text-slate-100 font-display font-semibold text-base mb-1.5">{title}</h3>
        {description && <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>}
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-ink-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-rose text-white hover:bg-rose/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
