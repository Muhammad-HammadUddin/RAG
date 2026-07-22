import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Database, FileType2, FileText, Layers, Plus } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { useKnowledgeList } from "../hooks/useKnowledgeList.js";
import { TableSkeleton, ErrorState } from "../components/States.jsx";
import { formatDate } from "../utils/format.js";

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-ink-900 border border-ink-700 rounded-xl p-5">
    <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-4 ${accent}`}>
      <Icon size={16} />
    </div>
    <p className="text-2xl font-display font-semibold text-slate-100">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{label}</p>
  </div>
);

const Dashboard = () => {
  const { items, loading, error, refetch } = useKnowledgeList();

  const stats = useMemo(() => {
    const pdfCount = items.filter((i) => i.type === "pdf").length;
    const textCount = items.filter((i) => i.type === "text").length;
    const totalChunks = items.reduce((sum, i) => sum + (i.chunkCount || 0), 0);
    return { total: items.length, pdfCount, textCount, totalChunks };
  }, [items]);

  const recent = items.slice(0, 5);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-display font-semibold text-slate-100">Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Snapshot of the TelecardBot knowledge base.</p>
        </div>
        <Link
          to="/knowledge/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-signal text-ink-950 hover:bg-signal-dim transition-colors"
        >
          <Plus size={15} />
          Add Knowledge
        </Link>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard icon={Database} label="Total documents" value={loading ? "—" : stats.total} accent="bg-ink-700 text-slate-300" />
            <StatCard icon={FileType2} label="PDF documents" value={loading ? "—" : stats.pdfCount} accent="bg-amber-soft text-amber" />
            <StatCard icon={FileText} label="Text entries" value={loading ? "—" : stats.textCount} accent="bg-signal-soft text-signal" />
            <StatCard icon={Layers} label="Total chunks embedded" value={loading ? "—" : stats.totalChunks} accent="bg-ink-700 text-slate-300" />
          </div>

          <div className="bg-ink-900 border border-ink-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-700 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-200">Recently added</h2>
              <Link to="/knowledge" className="text-xs text-signal hover:underline">
                View all
              </Link>
            </div>

            {loading ? (
              <TableSkeleton rows={4} />
            ) : recent.length === 0 ? (
              <p className="text-sm text-slate-500 px-5 py-10 text-center">
                No knowledge added yet. Upload a PDF or paste text to get started.
              </p>
            ) : (
              <div className="divide-y divide-ink-700">
                {recent.map((item) => (
                  <Link
                    key={item._id}
                    to={`/knowledge/${item._id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-ink-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-ink-700 flex items-center justify-center shrink-0">
                        {item.type === "pdf" ? (
                          <FileType2 size={14} className="text-amber" />
                        ) : (
                          <FileText size={14} className="text-signal" />
                        )}
                      </div>
                      <p className="text-sm text-slate-200 truncate">{item.title}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 ml-4">{formatDate(item.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
