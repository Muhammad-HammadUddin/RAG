# Telecard Knowledge Base — Admin Panel

Admin dashboard for managing the TelecardBot RAG knowledge base (PDFs + text entries),
built against the `/api/knowledge` backend.

## Setup

```bash
npm install
cp .env.example .env   # already pre-filled with http://localhost:5000/api/knowledge
npm run dev
```

Opens on `http://localhost:5173`. Make sure the backend is running on `http://localhost:5000`
(or update `VITE_API_BASE_URL` in `.env`).

## Structure

```
src/
 ├── api/axios.js              # configured axios instance + global error normalization
 ├── services/knowledgeService.js  # every backend call lives here — components never call axios directly
 ├── hooks/useKnowledgeList.js # list fetching/search state
 ├── components/               # Sidebar, Layout, Table, Badge, Modal, Toasts, loading/empty/error states
 ├── pages/
 │    ├── Dashboard.jsx            # stats overview
 │    ├── KnowledgeManagement.jsx  # list + search + delete
 │    ├── KnowledgeCreate.jsx      # upload PDF or paste text
 │    ├── KnowledgeView.jsx        # single document detail
 │    ├── KnowledgeEdit.jsx        # edit text, or replace PDF
 │    └── SemanticSearch.jsx       # test the Qdrant retrieval endpoint
 └── utils/format.js
```

## Notes on backend behavior

- `PUT /api/knowledge/:id` only works for `type: "text"` documents (updates title/content and re-embeds).
- PDFs can't have their extracted text edited directly — use `PUT /api/knowledge/:id/replace` to swap the file, which the Edit page does automatically when a document is type `pdf`.
- Delete is a hard delete on the backend (removes the Mongo doc + Qdrant vectors permanently) — the UI always confirms before calling it.
