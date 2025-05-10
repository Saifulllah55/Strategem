import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../Store/features/userSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#1c2331] text-white border-b border-[#2c323f]">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 bg-green-500 rounded-full animate-ping"></div>
        <span className="text-lg font-bold">Stratagem</span>
      </div>

      {/* Centered Links */}
      <div className="flex flex-1 justify-center gap-6">
        <a href="/projects" className="text-sm hover:text-green-400 transition-colors">Projects</a>
        <a href="/profile" className="text-sm hover:text-green-400 transition-colors">Profile</a>
        <a href="/search" className="text-sm hover:text-green-400 transition-colors">Search</a>
        <a href="/about" className="text-sm hover:text-green-400 transition-colors">About</a>
        <div className="text-sm hover:text-green-400 transition-colors cursor-pointer">English ▾</div>
      </div>

      {/* Sign Out */}
      <div>
        <button 
          onClick={handleSignOut}
          className="text-sm font-semibold hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
