import React from 'react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black text-white">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 bg-cyan-500 rounded-full animate-ping"></div>
        <span className="text-lg font-bold">Stratagem</span>
      </div>

      {/* Centered Links */}
      <div className="flex flex-1 justify-center gap-6">
        <a href="/projects" className="text-sm hover:text-cyan-300">Projects</a>
        <a href="/profile" className="text-sm hover:text-cyan-300">Profile</a>
        <a href="/search" className="text-sm hover:text-cyan-300">Search</a>
        <a href="/about" className="text-sm hover:text-cyan-300">About</a>
        <div className="text-sm hover:text-cyan-300 cursor-pointer">English ▾</div>
      </div>

      {/* Sign Out */}
      <div>
        <a href="/signout" className="text-sm font-semibold hover:text-red-400">Sign out</a>
      </div>
    </nav>
  );
}
