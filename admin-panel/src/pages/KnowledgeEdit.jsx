import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, UploadCloud, FileType2, X } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { ErrorState } from "../components/States.jsx";
import {
  getKnowledgeById,
  updateTextKnowledge,
  replacePdfKnowledge,
} from "../services/knowledgeService.js";
import { useToast } from "../components/ToastProvider.jsx";
import { formatBytes } from "../utils/format.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const KnowledgeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await getKnowledgeById(id);
        setItem(res.data);
        setTitle(res.data.title || "");
        setContent(res.data.content || "");
      } catch (err) {
        setLoadError(err.message || "Failed to load this document.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const validateFile = (f) => {
    if (!f) return null; // optional on edit — only required if user wants to replace
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return "Only PDF files are allowed.";
    if (f.size > MAX_FILE_SIZE) return "File must be smaller than 10 MB.";
    return null;
  };

  const handleFileSelect = (f) => {
    const err = validateFile(f);
    if (err) {
      setErrors((prev) => ({ ...prev, file: err }));
      setFile(null);
      return;
    }
    setErrors((prev) => ({ ...prev, file: null }));
    setFile(f);
  };

  const validateTextForm = () => {
    const next = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!content.trim()) next.content = "Content is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (item.type === "text") {
      if (!validateTextForm()) return;
      setSubmitting(true);
      try {
        await updateTextKnowledge(id, { title: title.trim(), content: content.trim() });
        toast.success("Knowledge updated successfully");
        navigate(`/knowledge/${id}`);
      } catch (err) {
        toast.error(err.message || "Failed to update knowledge");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // PDF flow — replace file is required by the backend's /replace route
    if (!file) {
      setErrors({ file: "Select a new PDF to replace the existing one." });
      return;
    }
    setSubmitting(true);
    setProgress(0);
    try {
      await replacePdfKnowledge(id, { file, onUploadProgress: setProgress });
      toast.success("PDF replaced and re-embedded successfully");
      navigate(`/knowledge/${id}`);
    } catch (err) {
      toast.error(err.message || "Failed to replace PDF");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {loading ? (
        <div className="max-w-2xl bg-ink-900 border border-ink-700 rounded-xl p-6 animate-pulse space-y-3">
          <div className="h-5 w-1/3 bg-ink-700 rounded" />
          <div className="h-24 w-full bg-ink-700 rounded mt-4" />
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => window.location.reload()} />
      ) : (
        <div className="max-w-2xl">
          <h1 className="text-xl font-display font-semibold text-slate-100 mb-1">Edit Knowledge</h1>
          <p className="text-sm text-slate-500 mb-6">
            {item.type === "text"
              ? "Update the title or content — it will be re-embedded automatically."
              : "PDF text content can't be edited directly. Upload a new file to replace and re-embed it."}
          </p>

          <form onSubmit={handleSubmit} className="bg-ink-900 border border-ink-700 rounded-xl p-6 space-y-5">
            {item.type === "text" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-ink-800 border border-ink-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50"
                  />
                  {errors.title && <p className="text-xs text-rose mt-1.5">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="w-full bg-ink-800 border border-ink-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50 resize-none"
                  />
                  {errors.content && <p className="text-xs text-rose mt-1.5">{errors.content}</p>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Current file</label>
                  <div className="flex items-center gap-3 bg-ink-800 border border-ink-600 rounded-lg px-4 py-3">
                    <FileType2 size={16} className="text-amber shrink-0" />
                    <p className="text-sm text-slate-300 truncate">{item.fileName}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Replace with new PDF</label>
                  {!file ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-ink-600 hover:border-ink-500 rounded-lg py-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <UploadCloud size={22} className="text-slate-500 mb-2" />
                      <p className="text-sm text-slate-300">
                        <span className="text-signal font-medium">Click to upload</span> a replacement PDF
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-ink-800 border border-ink-600 rounded-lg px-4 py-3">
                      <div className="w-9 h-9 rounded-md bg-amber-soft flex items-center justify-center shrink-0">
                        <FileType2 size={16} className="text-amber" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-200 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                      </div>
                      {!submitting && (
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="p-1.5 text-slate-500 hover:text-rose transition-colors"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  )}
                  {errors.file && <p className="text-xs text-rose mt-1.5">{errors.file}</p>}

                  {submitting && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Uploading…</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                        <div className="h-full bg-signal transition-all duration-200" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-signal text-ink-950 hover:bg-signal-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && (
                  <span className="w-3.5 h-3.5 border-2 border-ink-950/40 border-t-ink-950 rounded-full animate-spin" />
                )}
                {submitting ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-medium rounded-md text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default KnowledgeEdit;
