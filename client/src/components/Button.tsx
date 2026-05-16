import React from 'react';
import '../styles/Button.css';

interface ButtonProps {
    children: React.ReactNode;
    variant?: "primary" | "danger" | "secondary";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    disabled = false,
    onClick,
    className = "",
    type = "button",
}) => {
    const baseClass = "btn";
    const variantClass = `btn--${variant}`;
    const allClasses = `${baseClass} ${variantClass} ${className}`.trim();

    return (
        <button
            className={allClasses}
            disabled={disabled}
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    )
}