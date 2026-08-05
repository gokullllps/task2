import React from 'react';

export function TextInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  icon: Icon,
  autoComplete,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id}>
          <span>{label}</span>
        </label>
      )}
      <div className="input-with-icon">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={error ? 'input-error' : ''}
          {...props}
        />
        {Icon && <Icon size={18} className="field-icon" />}
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search tasks or categories...',
  onClear,
  className = '',
}) {
  return (
    <div className={`search-bar ${className}`}>
      <div className="search-icon-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          onClick={() => (onClear ? onClear() : onChange(''))}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
