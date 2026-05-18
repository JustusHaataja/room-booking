import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  }

  return (
    <div className="layout">
      {/* Header/Navigation */}
      <header className="header">
        <div className="container">
          <div className="header__content">
            <Link to="/" className="header__logo">
              
            </Link>

            <nav className="header__nav">
              <Link
                to="/"
                className={`nav-link ${isActive("/") ? "nav-link--active" : ""}`}
              >
                Rooms
              </Link>
              <Link
                to="/bookings"
                className={`nav-link ${
                  isActive("/bookings") ? "nav-link--active" : ""
                }`}
              >
                My Bookings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="footer__text">
            &copy; 2026 Roomly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}