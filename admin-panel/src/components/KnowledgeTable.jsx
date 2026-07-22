import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, FileText, FileType2 } from "lucide-react";
import Badge from "./Badge.jsx";
import { formatDate, truncate } from "../utils/format.js";

const KnowledgeTable = ({ items, onDeleteRequest }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-ink-700">
            <th className="px-5 py-3 font-medium">Document</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Chunks</th>
            <th className="px-5 py-3 font-medium">Created</th>
            <th className="px-5 py-3 font-medium">Updated</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-700">
          {items.map((item) => (
            <tr key={item._id} className="hover:bg-ink-800/60 transition-colors group">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-ink-700 flex items-center justify-center shrink-0">
                    {item.type === "pdf" ? (
                      <FileType2 size={14} className="text-amber" />
                    ) : (
                      <FileText size={14} className="text-signal" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-200 font-medium truncate max-w-[220px]">{item.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate max-w-[220px]">
                      {item.fileName || truncate(item.content, 40) || item._id}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={item.type}>{item.type}</Badge>
              </td>
              <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{item.chunkCount ?? 0}</td>
              <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(item.createdAt)}</td>
              <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(item.updatedAt)}</td>
              <td className="px-5 py-3.5">
                <Badge variant={item.status === "active" ? "active" : "deleted"}>
                  {item.status || "active"}
                </Badge>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1">
                  <button
                    title="View"
                    onClick={() => navigate(`/knowledge/${item._id}`)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-ink-700 transition-colors"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    title="Edit"
                    onClick={() => navigate(`/knowledge/${item._id}/edit`)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-signal hover:bg-ink-700 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => onDeleteRequest(item)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose hover:bg-ink-700 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KnowledgeTable;
