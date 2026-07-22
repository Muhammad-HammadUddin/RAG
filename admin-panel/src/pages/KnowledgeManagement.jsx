import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import Layout from "../components/Layout.jsx";
import KnowledgeTable from "../components/KnowledgeTable.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { TableSkeleton, EmptyState, ErrorState } from "../components/States.jsx";
import { useKnowledgeList } from "../hooks/useKnowledgeList.js";
import { deleteKnowledge } from "../services/knowledgeService.js";
import { useToast } from "../components/ToastProvider.jsx";

const KnowledgeManagement = () => {
  const { items, loading, error, refetch, runSearch } = useKnowledgeList();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch({ q: query, type: typeFilter });
  };

  const handleClear = () => {
    setQuery("");
    setTypeFilter("");
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteKnowledge(pendingDelete._id);
      toast.success(`"${pendingDelete.title}" deleted successfully`);
      setPendingDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete knowledge");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-semibold text-slate-100">Knowledge Base</h1>
          <p className="text-sm text-slate-500 mt-1">Manage documents used by the RAG chatbot.</p>
        </div>
        <button
          onClick={() => navigate("/knowledge/new")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-signal text-ink-950 hover:bg-signal-dim transition-colors"
        >
          <Plus size={15} />
          Add Knowledge
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title…"
            className="w-full bg-ink-900 border border-ink-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-ink-900 border border-ink-700 rounded-md px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-signal/50"
        >
          <option value="">All types</option>
          <option value="pdf">PDF</option>
          <option value="text">Text</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-md bg-ink-700 text-slate-200 hover:bg-ink-600 transition-colors"
        >
          Search
        </button>
        {(query || typeFilter) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      <div className="bg-ink-900 border border-ink-700 rounded-xl overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No knowledge documents found"
            description="Upload a PDF or add plain text to start building the chatbot's knowledge base."
            actionLabel="Add Knowledge"
            onAction={() => navigate("/knowledge/new")}
          />
        ) : (
          <KnowledgeTable items={items} onDeleteRequest={setPendingDelete} />
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete this document?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" and all its embedded vectors will be permanently removed. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </Layout>
  );
};

export default KnowledgeManagement;
