import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UploadCloud, FileType2, X } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { uploadPdfKnowledge, uploadTextKnowledge } from "../services/knowledgeService.js";
import { useToast } from "../components/ToastProvider.jsx";
import { formatBytes } from "../utils/format.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // matches backend multer limit

const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? "bg-signal/10 text-signal border border-signal/30" : "text-slate-400 hover:text-slate-200 border border-transparent"
    }`}
  >
    {children}
  </button>
);

const KnowledgeCreate = () => {
  const [mode, setMode] = useState("pdf"); // "pdf" | "text"
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const validateFile = (f) => {
    if (!f) return "Please select a PDF file.";
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  };

  const validate = () => {
    const next = {};
    if (mode === "pdf") {
      const fileErr = validateFile(file);
      if (fileErr) next.file = fileErr;
    } else {
      if (!title.trim()) next.title = "Title is required.";
      if (!content.trim()) next.content = "Content is required.";
      else if (content.trim().length < 10) next.content = "Content should be at least 10 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setProgress(0);
    try {
      if (mode === "pdf") {
        await uploadPdfKnowledge({
          file,
          title: title.trim() || undefined,
          onUploadProgress: setProgress,
        });
      } else {
        await uploadTextKnowledge({ title: title.trim(), content: content.trim() });
      }
      toast.success("Knowledge added successfully");
      navigate("/knowledge");
    } catch (err) {
      toast.error(err.message || "Failed to add knowledge");
    } finally {
      setSubmitting(false);
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

      <h1 className="text-xl font-display font-semibold text-slate-100 mb-1">Add Knowledge</h1>
      <p className="text-sm text-slate-500 mb-6">Upload a PDF or paste text — it will be chunked and embedded automatically.</p>

      <div className="max-w-2xl">
        <div className="flex gap-2 mb-6 bg-ink-900 border border-ink-700 rounded-lg p-1 w-fit">
          <TabButton active={mode === "pdf"} onClick={() => setMode("pdf")}>
            Upload PDF
          </TabButton>
          <TabButton active={mode === "text"} onClick={() => setMode("text")}>
            Paste Text
          </TabButton>
        </div>

        <form onSubmit={handleSubmit} className="bg-ink-900 border border-ink-700 rounded-xl p-6 space-y-5">
          {mode === "pdf" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Title <span className="text-slate-500 font-normal">(optional — defaults to filename)</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Prepaid Bundle Terms & Conditions"
                  className="w-full bg-ink-800 border border-ink-600 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">PDF File</label>

                {!file ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg py-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragActive ? "border-signal bg-signal/5" : "border-ink-600 hover:border-ink-500"
                    }`}
                  >
                    <UploadCloud size={26} className="text-slate-500 mb-2.5" />
                    <p className="text-sm text-slate-300">
                      <span className="text-signal font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF up to 10 MB</p>
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
                      <div
                        className="h-full bg-signal transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Refund Policy Summary"
                  className="w-full bg-ink-800 border border-ink-600 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50"
                />
                {errors.title && <p className="text-xs text-rose mt-1.5">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Paste the knowledge text here…"
                  className="w-full bg-ink-800 border border-ink-600 rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-signal/50 focus:border-signal/50 resize-none"
                />
                <div className="flex justify-between mt-1.5">
                  {errors.content ? (
                    <p className="text-xs text-rose">{errors.content}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-slate-500">{content.length} characters</p>
                </div>
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
              {submitting ? "Processing…" : "Add Knowledge"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/knowledge")}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium rounded-md text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default KnowledgeCreate;
