import React, { useRef, useEffect } from 'react';

/**
 * Premium 6-Box OTP Input Component
 * Features: Auto-focus, auto-advance, backspace navigation, paste support, arrow keys, mobile friendly.
 */
export default function OtpInput({ length = 6, value = '', onChange, disabled = false }) {
  const inputRefs = useRef([]);

  // Convert string value to array of characters padded to specified length
  const otpArray = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Auto focus first empty input box on mount
    const firstEmptyIndex = otpArray.findIndex((char) => !char);
    const indexToFocus = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
    if (inputRefs.current[indexToFocus] && !disabled) {
      inputRefs.current[indexToFocus].focus();
    }
  }, []);

  const focusInput = (index) => {
    if (index >= 0 && index < length && inputRefs.current[index]) {
      inputRefs.current[index].focus();
      inputRefs.current[index].select();
    }
  };

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!val) return;

    // Filter only numeric digits
    const digitsOnly = val.replace(/\D/g, '');
    if (!digitsOnly) return;

    // Handle single digit input
    const newOtpArray = [...otpArray];
    const newChar = digitsOnly[digitsOnly.length - 1]; // Get last typed digit
    newOtpArray[index] = newChar;
    const combinedValue = newOtpArray.join('');

    onChange(combinedValue);

    // Auto-advance to next input box if available
    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtpArray = [...otpArray];

      if (newOtpArray[index]) {
        // Clear current box digit
        newOtpArray[index] = '';
        onChange(newOtpArray.join(''));
      } else if (index > 0) {
        // Move to previous box and clear digit
        newOtpArray[index - 1] = '';
        onChange(newOtpArray.join(''));
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!pastedData) return;

    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, length);
    if (digitsOnly) {
      onChange(digitsOnly);
      // Focus box after last filled digit
      const targetIndex = Math.min(digitsOnly.length, length - 1);
      focusInput(targetIndex);
    }
  };

  return (
    <div className="otp-input-container" style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '14px 0' }}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(otpArray[index]);
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete="one-time-code"
            value={otpArray[index]}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`otp-box-digit ${isFilled ? 'filled' : ''}`}
            style={{
              width: '48px',
              height: '54px',
              fontSize: '1.5rem',
              fontWeight: 800,
              textAlign: 'center',
              borderRadius: '12px',
              border: isFilled ? '2.5px solid #7c3aed' : '2px solid #94a3b8',
              background: isFilled ? '#f3e8ff' : '#f8fafc',
              color: isFilled ? '#6b21a8' : '#0f172a',
              outline: 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isFilled
                ? '0 0 0 4px rgba(124, 58, 237, 0.2), 0 4px 12px rgba(124, 58, 237, 0.15)'
                : '0 2px 4px rgba(0, 0, 0, 0.05)',
            }}
          />
        );
      })}
    </div>
  );
}
