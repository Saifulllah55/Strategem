import React, { useState } from "react";
import { FiBell } from "react-icons/fi";
import Announcement from "./Announcement";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const announcements = [
    { id: 1, message: "New project deadline updated!I hope everybody adheres to the new deadline and deliver their best output", announcer: "Admin" },
    { id: 2, message: "Team meeting scheduled for tomorrow.", announcer: "Manager" },
    { id: 3, message: "Feature update: Kanban improvements.", announcer: "System" },
  ];

  return (
    <>
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

        {/* Notification Bell */}
        <div className="relative">
          <button className="relative p-2" onClick={() => setOpen(true)}>
            <FiBell className="text-xl hover:text-cyan-300" />
            {announcements.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {announcements.length}
              </span>
            )}
          </button>
        </div>

        {/* Sign Out */}
        <div>
          <a href="/signout" className="text-sm font-semibold hover:text-red-400">Sign out</a>
        </div>
      </nav>

      {/* Announcement Popup */}
      {open && <Announcement notifications={announcements} onClose={() => setOpen(false)} />}
    </>
  );
}
