import React from 'react';
import { Link } from 'react-router-dom';

function HomeNav  ()  {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black text-white">
      {/* Logo on the left */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 bg-cyan-500 rounded-full animate-ping"></div>
        <span className="text-lg font-bold">Stratagem</span>
      </div>

      {/* Login and Sign Up on the right */}
      <div className="flex gap-4">
       
       <Link to="/dashboard"> <button className="text-white hover:text-cyan-400">Login</button></Link>
       
        <button className="border border-white px-4 py-1 rounded hover:bg-white hover:text-black transition">
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default HomeNav;
