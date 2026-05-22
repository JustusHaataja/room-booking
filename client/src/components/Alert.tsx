import React from 'react';
import { IoClose } from 'react-icons/io5';
import '../styles/Alert.css';

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  className = "",
}) => {
  return (
    <div className={`alert alert--${type} ${className}`.trim()}>
      <div className="alert__content">
        <span className={`alert__icon alert__icon--${type}`}>
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "warning" && "⚠"}
          {type === "info" && "ℹ"}
        </span>
        <span className="alert__message">{message}</span>
      </div>
      {onClose && (
        <button
          className="alert__close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <IoClose size={24} />
        </button>
      )}
    </div>
  )
}