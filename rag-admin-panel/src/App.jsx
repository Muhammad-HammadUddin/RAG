import React from 'react';
import UploadPdfCard from './components/UploadPdfCard';
import PasteTextCard from './components/PasteTextCard';
import ReindexCard from './components/ReindexCard';

export default function App() {
  return (
    <div className="page">
      <div className="page__field" aria-hidden="true" />

      <header className="page__header">
        <span className="page__eyebrow">Retrieval-Augmented Generation</span>
        <h1 className="page__title">Knowledge Base Admin</h1>
        <p className="page__subtitle">
          Add source material to the index or replace it entirely. Changes take effect
          immediately.
        </p>
      </header>

      <main className="page__content">
        <UploadPdfCard />
        <PasteTextCard />
        <ReindexCard />
      </main>

      <footer className="page__footer">
        <span>Base URL</span>
        <code>http://localhost:5000/api</code>
      </footer>
    </div>
  );
}
