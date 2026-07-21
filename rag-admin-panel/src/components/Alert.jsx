import React from 'react';

/**
 * @param {'success' | 'error'} type
 * @param {string} message
 */
export default function Alert({ type, message }) {
  if (!message) return null;

  return (
    <div className={`alert alert--${type}`} role="status">
      <span className="alert__icon" aria-hidden="true">
        {type === 'success' ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13.5 4.5L6.5 11.5L3 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 4.5V8.75"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="8" cy="11.25" r="0.9" fill="currentColor" />
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        )}
      </span>
      <span className="alert__text">{message}</span>
    </div>
  );
}
