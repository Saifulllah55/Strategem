import React from "react";
import { Link, useLocation } from "react-router-dom";

function HomeNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-extrabold tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
              Stratagem
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className={`text-sm font-semibold tracking-wide transition-colors px-3 py-1 rounded-md ${
                isActive("/login")
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
              }`}
            >
              Login
            </Link>
            <Link to="/login">
              <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2 rounded-md shadow transition-colors">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HomeNav;
