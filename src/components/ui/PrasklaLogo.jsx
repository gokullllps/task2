import React from 'react';

/**
 * Official Unmodified Praskla Technology Company Logo
 * Renders the exact company logo image file directly without modification.
 */
export default function PrasklaLogo({ size = 36, className = '', style = {} }) {
  return (
    <img
      src="/logo.png"
      alt="Praskla Technology Logo"
      width={size}
      height={size}
      className={className}
      style={{
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
        ...style,
      }}
    />
  );
}
