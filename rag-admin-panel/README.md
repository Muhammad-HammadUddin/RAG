# RAG Knowledge Base — Admin Panel

A single-page React admin panel for managing a RAG knowledge base: upload PDFs,
paste raw text, and reindex (replace) the whole knowledge base.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` and expects the API at
`http://localhost:5000/api`.

## Wiring up your existing axios instance

Every request goes through `src/api/knowledgeApi.js`, never directly through
axios in a component. `src/api/axiosInstance.js` is a stand-in for your
project's real axios instance.

If you already have one elsewhere in your codebase:

1. Delete `src/api/axiosInstance.js`.
2. In `src/api/knowledgeApi.js`, change:
   ```js
   import axiosInstance from './axiosInstance';
   ```
   to point at your real instance, e.g.:
   ```js
   import axiosInstance from '../../lib/axios';
   ```

Nothing else needs to change.

## Project structure

```
src/
  api/
    axiosInstance.js   # placeholder for your existing axios instance
    knowledgeApi.js     # uploadPDF, addText, reindex
  components/
    Alert.jsx
    ConfirmModal.jsx
    EndpointTag.jsx
    PasteTextCard.jsx
    ReindexCard.jsx
    Spinner.jsx
    UploadPdfCard.jsx
  styles/
    index.css
  App.jsx
  main.jsx
```

## Endpoints used

| Action        | Method | Path                       | Body                          |
|---------------|--------|-----------------------------|--------------------------------|
| Upload PDF    | POST   | `/knowledge/upload-pdf`     | `multipart/form-data` → `file` |
| Add text      | POST   | `/knowledge/add-text`       | `{ "text": "..." }`            |
| Reindex       | POST   | `/knowledge/reindex`        | `multipart/form-data` → `file` |
