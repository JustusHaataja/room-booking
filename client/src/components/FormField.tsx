import React from 'react';
import '../styles/FormField.css';

interface FormFieldProps {
  label: string;
  type?: "text" | "email" | "password" | "number" | "datetime-local" | "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error,
  required = false,
  className = "",
}) => {
  const inputId = `input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={inputId} className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={inputId}
          className={`form-field__input ${error ? "form-field__input--error" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          className={`form-field__input ${error ? "form-field__input--error" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {error && <span className="form-field__error">{error}</span>}
    </div>
  )
}