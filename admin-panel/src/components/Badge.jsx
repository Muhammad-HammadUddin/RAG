const variants = {
  pdf: "bg-amber-soft text-amber border-amber/30",
  text: "bg-signal-soft text-signal border-signal/30",
  active: "bg-signal-soft text-signal border-signal/30",
  deleted: "bg-rose-soft text-rose border-rose/30",
  neutral: "bg-ink-700 text-slate-300 border-ink-600",
};

const Badge = ({ children, variant = "neutral" }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide border ${variants[variant] || variants.neutral}`}
  >
    {children}
  </span>
);

export default Badge;
