import React, { useState } from 'react';
import { addText } from '../api/knowledgeApi';
import Spinner from './Spinner';
import Alert from './Alert';
import EndpointTag from './EndpointTag';

const MAX_CHARS = 20000;

export default function PasteTextCard() {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const trimmedLength = text.trim().length;
  const overLimit = text.length > MAX_CHARS;

  const handleSubmit = async () => {
    if (!trimmedLength || overLimit || isSubmitting) return;

    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      await addText(text.trim());
      setStatus({ type: 'success', message: 'Text was added to the knowledge base.' });
      setText('');
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Could not add text. Check that the server is running and try again.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Paste Text</h2>
          <p className="card__subtitle">Append raw text to the existing knowledge base.</p>
        </div>
        <EndpointTag method="POST" path="/knowledge/add-text" />
      </div>

      <div className="field">
        <textarea
          className="textarea"
          placeholder="Paste or type the content you want indexed…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (status.type) setStatus({ type: null, message: '' });
          }}
          disabled={isSubmitting}
          rows={8}
        />
        <div className={`char-counter ${overLimit ? 'char-counter--over' : ''}`}>
          {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </div>
      </div>

      <div className="card__footer">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={!trimmedLength || overLimit || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner size={14} /> Submitting…
            </>
          ) : (
            'Submit'
          )}
        </button>
      </div>

      <Alert type={status.type} message={status.message} />
    </section>
  );
}
