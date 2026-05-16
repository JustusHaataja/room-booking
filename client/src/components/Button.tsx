import React from 'react';
import './Button.css';

interface ButtonProps {
    children: React.ReactNode;
    variant?: "primary" | "danger" | "secondary";
    disabled?: boolean;
    onClick?: () => void;
    classname?: string;
    type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    disabled = false,
    onClick,
    classname = "",
    type = "button",
}) => {
    const baseClass = "btn";
    const variantClass = `btn--${variant}`;
    const allClasses = `${baseClass} ${variantClass} ${classname}`.trim();

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