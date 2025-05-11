import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markNotificationAsRead } from "../Store/features/notificationSlice";
import { Link } from "react-router-dom";

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const { items: notifications, loading } = useSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    dispatch(fetchNotifications());
    
    // Set up a refresh interval to check for new notifications (every 2 minutes)
    const refreshInterval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 2 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);  }, []);

  const handleNotificationClick = (notification) => {
    // If the notification isn't read yet, mark it as read
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 border border-gray-400 px-4 py-2 rounded-md hover:bg-white hover:text-black transition text-sm"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="text-xl">🔔</span> Notifications
        {notifications.some((n) => !n.read) && (
          <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-ping inline-block"></span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#1c2331] rounded-xl shadow-2xl shadow-black/40 z-50 p-3 border border-[#232b36]"
          role="menu"
        >
          <h4 className="text-lg font-semibold mb-2 text-white">Notifications</h4>

          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-400 py-8 text-center">No notifications</div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (                <li
                  key={n._id}
                  className={`p-3 rounded transition hover:bg-[#2a2f3c] ${!n.read ? "bg-[#232b36]" : ""}`}
                  role="menuitem"
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="text-sm text-white mb-1">{n.content}</div>
                  {n.link && (
                    <Link to={n.link} className="text-xs text-blue-400 hover:underline">
                      View
                    </Link>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
