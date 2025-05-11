import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BsBell, BsCalendarCheck, BsCheckCircle } from 'react-icons/bs';
import { RiCalendarTodoFill } from 'react-icons/ri';
import { fetchUpcomingReminders, updateReminder } from '../Store/features/reminderSlice';
import ReminderModal from './ReminderModal';
import { Link } from 'react-router-dom';

const ReminderDropdown = () => {
  const dispatch = useDispatch();
  const { upcomingReminders, loading } = useSelector(state => state.reminders);
  
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  
  const dropdownRef = useRef(null);
  
  // Fetch upcoming reminders when component mounts
  useEffect(() => {
    dispatch(fetchUpcomingReminders());
    
    // Set up interval to check for reminders every 5 minutes
    const intervalId = setInterval(() => {
      dispatch(fetchUpcomingReminders());
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [dispatch]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const openAddReminderModal = () => {
    setSelectedReminder(null);
    setShowModal(true);
    setIsOpen(false);
  };
  
  const openEditReminderModal = (reminder) => {
    setSelectedReminder(reminder);
    setShowModal(true);
    setIsOpen(false);
  };
  
  const handleMarkAsComplete = (id) => {
    dispatch(updateReminder({ id, reminderData: { completed: true } }));
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === date.toDateString();
    
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    if (isToday) {
      return `Today at ${formattedHours}:${minutes} ${ampm}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${formattedHours}:${minutes} ${ampm}`;
    } else {
      return date.toLocaleDateString() + ` at ${formattedHours}:${minutes} ${ampm}`;
    }
  };
  
  const isDueSoon = (dateString) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    const diffHours = (dueDate - now) / (1000 * 60 * 60);
    return diffHours <= 24; // Due within 24 hours
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Reminder button with badge */}
      <button
        onClick={toggleDropdown}
        className="rounded-full p-2 hover:bg-[#262e3f] relative"
        aria-label="Reminders"
      >
        <RiCalendarTodoFill className="text-xl text-gray-300" />
        {upcomingReminders.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {upcomingReminders.length}
          </span>
        )}
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#121620] border border-gray-700 rounded-md shadow-lg z-20">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-white">Reminders</h3>
            <button
              onClick={openAddReminderModal}
              className="bg-green-600 text-white text-sm px-2 py-1 rounded hover:bg-green-700 transition"
            >
              + New
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500 mx-auto mb-2"></div>
                Loading reminders...
              </div>
            ) : upcomingReminders.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <BsCalendarCheck className="text-3xl mx-auto mb-2" />
                <p>No upcoming reminders</p>
                <button
                  onClick={openAddReminderModal}
                  className="mt-2 text-green-500 hover:text-green-400 transition"
                >
                  Create a reminder
                </button>
              </div>
            ) : (
              <ul>
                {upcomingReminders.map(reminder => (
                  <li 
                    key={reminder._id} 
                    className={`p-3 border-b border-gray-700 hover:bg-gray-800 ${
                      isDueSoon(reminder.dueDate) ? 'bg-red-900 bg-opacity-20' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1 pr-2">
                        <h4 
                          className="font-medium text-white cursor-pointer" 
                          onClick={() => openEditReminderModal(reminder)}
                        >
                          {reminder.title}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">{formatDate(reminder.dueDate)}</p>
                        {reminder.description && (
                          <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                            {reminder.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleMarkAsComplete(reminder._id)}
                        className="self-start text-gray-400 hover:text-green-500 transition mt-1"
                        title="Mark as complete"
                      >
                        <BsCheckCircle className="text-lg" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
            <div className="p-2 border-t border-gray-700">
            <Link
              to="/reminders"
              className="block w-full text-center text-sm text-gray-400 hover:text-white py-1 mb-1"
            >
              View all reminders
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-gray-400 hover:text-white py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Reminder Modal */}
      <ReminderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reminder={selectedReminder}
      />
    </div>
  );
};

export default ReminderDropdown;
