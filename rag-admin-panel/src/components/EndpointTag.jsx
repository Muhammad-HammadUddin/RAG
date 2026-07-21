import React from 'react';

export default function EndpointTag({ method, path }) {
  return (
    <div className="endpoint-tag">
      <span className={`endpoint-tag__method endpoint-tag__method--${method.toLowerCase()}`}>
        {method}
      </span>
      <span className="endpoint-tag__path">{path}</span>
    </div>
  );
}
