import React from 'react';

export interface SolidInputProps {
  type?: 'text' | 'email' | 'tel' | 'password';
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  label?: string;
  error?: string;
  className?: string;
}

/**
 * SolidInput - A clean, solid white input component
 * 
 * Features:
 * - Solid white background with excellent contrast
 * - Smooth focus transitions
 * - Optional label and error message
 * - Fully responsive with clamp() sizing
 * - Accessible with proper ARIA attributes
 * 
 * @example
 * ```tsx
 * <SolidInput
 *   id="name"
 *   name="name"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   placeholder="Enter your name"
 *   label="Your Name"
 *   required
 * />
 * ```
 */
const SolidInput: React.FC<SolidInputProps> = ({
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  label,
  error,
  className = '',
}) => {
  return (
    <div className="solid-input-wrapper">
      {label && (
        <label htmlFor={id} className="solid-input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`solid-input ${error ? 'has-error' : ''} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} className="solid-input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default SolidInput;
