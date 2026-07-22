import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Download, FileType2, FileText } from "lucide-react";
import Layout from "../components/Layout.jsx";
import Badge from "../components/Badge.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { ErrorState } from "../components/States.jsx";
import { getKnowledgeById, deleteKnowledge, getDownloadUrl } from "../services/knowledgeService.js";
import { useToast } from "../components/ToastProvider.jsx";
import { formatDate, formatBytes } from "../utils/format.js";

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-ink-700 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm text-slate-200 font-mono">{value}</span>
  </div>
);

const KnowledgeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getKnowledgeById(id);
      setItem(res.data);
    } catch (err) {
      setError(err.message || "Failed to load this document.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteKnowledge(id);
      toast.success("Knowledge deleted successfully");
      navigate("/knowledge");
    } catch (err) {
      toast.error(err.message || "Failed to delete knowledge");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <button
        onClick={() => navigate("/knowledge")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Knowledge Base
      </button>

      {loading ? (
        <div className="max-w-2xl bg-ink-900 border border-ink-700 rounded-xl p-6 animate-pulse space-y-3">
          <div className="h-5 w-1/3 bg-ink-700 rounded" />
          <div className="h-3 w-1/4 bg-ink-700 rounded" />
          <div className="h-24 w-full bg-ink-700 rounded mt-4" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchItem} />
      ) : item ? (
        <div className="max-w-2xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-ink-700 flex items-center justify-center shrink-0">
                {item.type === "pdf" ? (
                  <FileType2 size={18} className="text-amber" />
                ) : (
                  <FileText size={18} className="text-signal" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-display font-semibold text-slate-100">{item.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={item.type}>{item.type}</Badge>
                  <Badge variant={item.status === "active" ? "active" : "deleted"}>
                    {item.status || "active"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.type === "pdf" && (
                <a
                  href={getDownloadUrl(item._id)}
                  className="p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-ink-700 transition-colors"
                  title="Download PDF"
                >
                  <Download size={16} />
                </a>
              )}
              <Link
                to={`/knowledge/${item._id}/edit`}
                className="p-2 rounded-md text-slate-400 hover:text-signal hover:bg-ink-700 transition-colors"
                title="Edit"
              >
                <Pencil size={16} />
              </Link>
              <button
                onClick={() => setConfirmOpen(true)}
                className="p-2 rounded-md text-slate-400 hover:text-rose hover:bg-ink-700 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="bg-ink-900 border border-ink-700 rounded-xl p-5 mb-5">
            <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-1 font-medium">Metadata</h2>
            <InfoRow label="Document ID" value={item._id} />
            <InfoRow label="Chunks embedded" value={item.chunkCount ?? 0} />
            <InfoRow label="Embedding model" value={item.embeddingModel || "—"} />
            {item.type === "pdf" && (
              <>
                <InfoRow label="File name" value={item.fileName || "—"} />
                <InfoRow label="File size" value={formatBytes(item.fileSize)} />
                <InfoRow label="MIME type" value={item.mimeType || "—"} />
              </>
            )}
            <InfoRow label="Created" value={formatDate(item.createdAt)} />
            <InfoRow label="Last updated" value={formatDate(item.updatedAt)} />
          </div>

          {item.type === "text" && item.content && (
            <div className="bg-ink-900 border border-ink-700 rounded-xl p-5">
              <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-medium">Content</h2>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{item.content}</p>
            </div>
          )}
        </div>
      ) : null}

      <ConfirmModal
        open={confirmOpen}
        title="Delete this document?"
        description={item ? `"${item.title}" and all its embedded vectors will be permanently removed.` : ""}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Layout>
  );
};

export default KnowledgeView;
