import React, { useState } from "react";

export default function Announcement({ notifications, onClose }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <>
      {/* Main Announcement Popup */}
      <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center">
        <div className="bg-gray-900 text-white rounded-lg shadow-lg w-96 p-4">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 border-gray-700">
            <h3 className="text-lg font-semibold">Announcements</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">✖</button>
          </div>

          {/* Notifications List */}
          <div className="mt-3 space-y-2">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 p-3 border-b border-gray-700 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === notif.id ? null : notif.id)}
                >
                  {/* Circular Icon */}
                  <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {notif.announcer[0]} {/* First letter of announcer */}
                  </div>

                  {/* Announcer Name & Message */}
                  <div className="flex flex-col">
                    <span className="font-bold text-cyan-300">{notif.announcer}</span>
                    <span className="text-sm">
                      {expandedId === notif.id ? notif.message : `${notif.message.substring(0, 50)}...`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">No new announcements.</p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 text-right">
            <button onClick={onClose} className="text-sm text-cyan-300 hover:underline">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Announcer Name Modal with Transparent Background */}
      {expandedId !== null && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center">
          <div className="bg-gray-900 text-white rounded-lg shadow-lg w-96 p-4">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 border-gray-700">
              <h3 className="text-lg font-semibold">{notifications.find((notif) => notif.id === expandedId)?.announcer}</h3>
              <button onClick={() => setExpandedId(null)} className="text-gray-400 hover:text-gray-200">✖</button>
            </div>

            {/* Full Message Content */}
            <div className="mt-3">
              {notifications.find((notif) => notif.id === expandedId)?.message}
            </div>

            {/* Footer */}
            <div className="mt-3 text-right">
              <button onClick={() => setExpandedId(null)} className="text-sm text-cyan-300 hover:underline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
