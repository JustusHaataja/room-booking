import React from 'react';
import '../styles/Card.css';

interface CardProps {
    children: React.ReactNode;
    elevated?: boolean;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    elevated = false,
    className = "",
}) => {
    const baseClass = "card";
    const elevatedClass  = elevated ? "card--elevated" : "";
    const allClasses = `${baseClass} ${elevatedClass} ${className}`.trim();

    return (
        <div className={allClasses}>{children}</div>
    )
}