import { NavLink } from "react-router-dom";
import { LayoutGrid, Database, FilePlus2, SearchCode, Radio } from "lucide-react";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/knowledge", label: "Knowledge Base", icon: Database, end: false },
  { to: "/knowledge/new", label: "Add Knowledge", icon: FilePlus2, end: true },
  { to: "/search", label: "Semantic Search", icon: SearchCode, end: true },
];

const Sidebar = () => {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-ink-900 border-r border-ink-700 flex flex-col">
      <div className="px-5 py-6 flex items-center gap-2.5 border-b border-ink-700">
        <div className="w-8 h-8 rounded-md bg-signal/15 border border-signal/30 flex items-center justify-center">
          <Radio size={16} className="text-signal" />
        </div>
        <div>
          <p className="font-display font-semibold text-slate-100 text-sm leading-tight">Telecard</p>
          <p className="text-[11px] text-slate-500 leading-tight tracking-wide">KNOWLEDGE OPS</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-signal/10 text-signal border border-signal/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-ink-800 border border-transparent"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-ink-700">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />
          RAG pipeline connected
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
