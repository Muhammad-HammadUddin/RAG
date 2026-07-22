import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-ink-950 text-slate-300">
    <p className="text-5xl font-display font-semibold text-slate-700 mb-2">404</p>
    <p className="text-sm text-slate-500 mb-5">This page doesn't exist.</p>
    <Link to="/" className="text-sm text-signal hover:underline">
      Back to Overview
    </Link>
  </div>
);

export default NotFound;
