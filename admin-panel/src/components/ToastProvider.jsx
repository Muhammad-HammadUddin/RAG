import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-signal shrink-0" />,
    error: <XCircle size={18} className="text-rose shrink-0" />,
    info: <Info size={18} className="text-amber shrink-0" />,
  };

  const borders = {
    success: "border-signal/30",
    error: "border-rose/30",
    info: "border-amber/30",
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[340px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 bg-ink-800 border ${borders[t.type]} rounded-lg px-4 py-3 shadow-panel animate-[fadeIn_0.15s_ease-out]`}
          >
            {icons[t.type]}
            <p className="text-sm text-slate-100 leading-snug flex-1">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
