import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, CheckIcon } from '../Icons';

export function TextInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error,
  success = false,
  disabled = false,
  icon: Icon,
  autoComplete,
  className = '',
  floating = false,
  showPasswordToggle = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const effectiveType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${success ? 'has-success' : ''} ${floating ? 'floating-group' : ''} ${className}`}>
      {label && !floating && (
        <label htmlFor={id}>
          <span>{label}</span>
        </label>
      )}

      <div className="input-with-icon">
        <input
          id={id}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={floating ? ' ' : placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`text-input ${error ? 'input-error' : ''} ${success ? 'input-success' : ''} ${floating ? 'floating-input' : ''}`}
          {...props}
        />

        {floating && label && (
          <label htmlFor={id} className="floating-label">
            {label}
          </label>
        )}

        {Icon && <Icon size={18} className="field-icon" />}

        {isPasswordType && showPasswordToggle && (
          <button
            type="button"
            className="input-action-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}

        {success && !showPasswordToggle && (
          <span className="input-success-icon" aria-hidden="true">
            <CheckIcon size={16} />
          </span>
        )}
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

export default TextInput;

