import api from "../api/axios.js";

/**
 * All Knowledge Base API calls in one place.
 * Every function returns response.data (the backend's {success, message, data} envelope).
 * Errors are already normalized by the axios interceptor — callers just catch { message }.
 */

// ---- Reads ----

export const getAllKnowledge = async () => {
  const res = await api.get("/");
  return res.data;
};

export const getKnowledgeById = async (id) => {
  const res = await api.get(`/${id}`);
  return res.data;
};

export const searchKnowledge = async ({ q, type } = {}) => {
  const params = {};
  if (q) params.q = q;
  if (type) params.type = type;
  const res = await api.get("/search", { params });
  return res.data;
};

export const testSemanticSearch = async ({ query, tenantId, limit }) => {
  const res = await api.post("/test-search", { query, tenantId, limit });
  return res.data;
};

// ---- Creates ----

export const uploadPdfKnowledge = async ({ file, title, tenantId, onUploadProgress }) => {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (tenantId) formData.append("tenantId", tenantId);

  const res = await api.post("/pdf", formData, {
    // Do NOT set Content-Type manually — the browser sets the multipart boundary itself.
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percent);
      }
    },
  });
  return res.data;
};

export const uploadTextKnowledge = async ({ title, content, tenantId }) => {
  const res = await api.post("/text", { title, content, tenantId });
  return res.data;
};

// ---- Updates ----

export const updateTextKnowledge = async (id, { title, content, tenantId }) => {
  const res = await api.put(`/${id}`, { title, content, tenantId });
  return res.data;
};

export const replacePdfKnowledge = async (id, { file, tenantId, onUploadProgress }) => {
  const formData = new FormData();
  formData.append("file", file);
  if (tenantId) formData.append("tenantId", tenantId);

  const res = await api.put(`/${id}/replace`, formData);
  return res.data;
};

// ---- Delete ----

export const deleteKnowledge = async (id) => {
  const res = await api.delete(`/${id}`);
  return res.data;
};

// ---- Download ----

export const getDownloadUrl = (id) => {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/knowledge";
  return `${base}/${id}/download`;
};
