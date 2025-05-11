import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../Store/features/userSlice';
import ReminderDropdown from './ReminderDropdown';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/reminders', label: 'Reminders' },
    { path: '/search', label: 'Search' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="text-xl font-extrabold tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
              Stratagem
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Reminders Dropdown */}
            <ReminderDropdown />

            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center font-semibold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block text-sm font-semibold">{user?.username || 'User'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--color-surface)] border border-[var(--color-border)] py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
