import { useState } from "react";
import { SearchCode, Sparkles } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { testSemanticSearch } from "../services/knowledgeService.js";
import { useToast } from "../components/ToastProvider.jsx";
import { EmptyState } from "../components/States.jsx";

const SemanticSearchPage = () => {
  const [query, setQuery] = useState("");
  const [tenantId, setTenantId] = useState("default");
  const [limit, setLimit] = useState(5);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Enter a query to test semantic search");
      return;
    }
    setLoading(true);
    try {
      const res = await testSemanticSearch({ query: query.trim(), tenantId, limit: Number(limit) });
      setResults(res.data || []);
    } catch (err) {
      toast.error(err.message || "Semantic search failed");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
          <SearchCode size={18} className="text-signal" />
          Semantic Search
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Test the Qdrant vector retrieval that powers TelecardBot's RAG responses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-ink-900 border border-ink-700 rounded-xl p-5 mb-6 max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Query</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What are the prepaid bundle prices?"
            className="w-full bg-ink-800 border border-ink-600 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50"
          />
        </div>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tenant ID</label>
            <input
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full bg-ink-800 border border-ink-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50"
            />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Limit</label>
            <input
              type="number"
              min={1}
              max={20}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-ink-800 border border-ink-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-signal text-ink-950 hover:bg-signal-dim transition-colors disabled:opacity-50"
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-ink-950/40 border-t-ink-950 rounded-full animate-spin" />}
          {loading ? "Searching…" : "Run Search"}
        </button>
      </form>

      {results !== null && (
        <div className="max-w-2xl space-y-3">
          {results.length === 0 ? (
            <EmptyState title="No matches found" description="Try a different query or check that documents have been embedded." />
          ) : (
            results.map((r, i) => (
              <div key={i} className="bg-ink-900 border border-ink-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-signal" />
                    {r.title || "Untitled chunk"}
                  </p>
                  <span className="text-xs font-mono text-slate-500">
                    score {typeof r.score === "number" ? r.score.toFixed(3) : r.score}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{r.text}</p>
              </div>
            ))
          )}
        </div>
      )}
    </Layout>
  );
};

export default SemanticSearchPage;
