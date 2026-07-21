import React, { useRef, useState } from 'react';
import { uploadPDF } from '../api/knowledgeApi';
import Spinner from './Spinner';
import Alert from './Alert';
import EndpointTag from './EndpointTag';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPdfCard() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setStatus({ type: null, message: '' });

    if (!selected) {
      setFile(null);
      return;
    }

    if (selected.type !== 'application/pdf') {
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setStatus({ type: 'error', message: 'Only PDF files are allowed.' });
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;

    setIsUploading(true);
    setStatus({ type: null, message: '' });

    try {
      await uploadPDF(file);
      setStatus({ type: 'success', message: `"${file.name}" was added to the knowledge base.` });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Upload failed. Check that the server is running and try again.';
      setStatus({ type: 'error', message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Upload PDF</h2>
          <p className="card__subtitle">Append a document to the existing knowledge base.</p>
        </div>
        <EndpointTag method="POST" path="/knowledge/upload-pdf" />
      </div>

      <div className="field">
        <label className="file-picker" htmlFor="upload-pdf-input">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 12V3M9 3L5.5 6.5M9 3L12.5 6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.5 12.5V14C2.5 14.8284 3.17157 15.5 4 15.5H14C14.8284 15.5 15.5 14.8284 15.5 14V12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Choose PDF
          <input
            id="upload-pdf-input"
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            hidden
          />
        </label>

        <div className="file-picker__selected">
          {file ? (
            <>
              <span className="file-chip">
                <span className="file-chip__name">{file.name}</span>
                <span className="file-chip__size">{formatBytes(file.size)}</span>
              </span>
            </>
          ) : (
            <span className="file-picker__empty">No file selected</span>
          )}
        </div>
      </div>

      <div className="card__footer">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>
              <Spinner size={14} /> Uploading…
            </>
          ) : (
            'Upload'
          )}
        </button>
      </div>

      <Alert type={status.type} message={status.message} />
    </section>
  );
}
