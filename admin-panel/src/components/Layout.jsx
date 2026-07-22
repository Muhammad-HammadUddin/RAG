import Sidebar from "./Sidebar.jsx";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-ink-950 text-slate-200 font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 px-8 py-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
