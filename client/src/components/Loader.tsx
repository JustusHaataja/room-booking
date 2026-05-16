import React from 'react';
import '../styles/Loader.css';

interface LoaderProps {
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = "medium",
  fullScreen = false,
  message,
}) => {
  const containerClass = fullScreen ? "loader--fullscreen" : "";

  return (
    <div className={`loader ${containerClass}`.trim()}>
      <div className={`spinner spinner--${size}`}></div>
      {message && <p className="loader__message">{message}</p>}
    </div>
  )
}