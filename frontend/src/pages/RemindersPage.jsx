import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReminders, updateReminder, deleteReminder } from '../Store/features/reminderSlice';
import { BsCheck, BsTrash, BsPencil, BsCalendarPlus } from 'react-icons/bs';
import ReminderModal from '../components/ReminderModal';

const RemindersPage = () => {
  const dispatch = useDispatch();
  const { reminders, loading, error } = useSelector(state => state.reminders);
  const [showModal, setShowModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'completed'

  useEffect(() => {
    dispatch(fetchReminders());
  }, [dispatch]);

  const handleCreateReminder = () => {
    setSelectedReminder(null);
    setShowModal(true);
  };

  const handleEditReminder = (reminder) => {
    setSelectedReminder(reminder);
    setShowModal(true);
  };

  const handleToggleComplete = (reminder) => {
    dispatch(updateReminder({
      id: reminder._id,
      reminderData: { completed: !reminder.completed }
    }));
  };

  const handleDeleteReminder = (id) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      dispatch(deleteReminder(id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Set both dates to midnight for comparison
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = dateWithoutTime - todayWithoutTime;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Format time
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const timeStr = `${formattedHours}:${minutes} ${ampm}`;
    
    // Format date
    if (diffDays === 0) {
      return `Today at ${timeStr}`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${timeStr}`;
    } else if (diffDays === -1) {
      return `Yesterday at ${timeStr}`;
    } else if (diffDays < -1) {
      return `${Math.abs(diffDays)} days ago at ${timeStr}`;
    } else {
      return `In ${diffDays} days at ${timeStr}`;
    }
  };

  const isOverdue = (dateString) => {
    const dueDate = new Date(dateString);
    const now = new Date();
    return dueDate < now;
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'upcoming') {
      return !reminder.completed;
    } else if (filter === 'completed') {
      return reminder.completed;
    }
    return true; // 'all' filter
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Reminders</h1>
        <button
          onClick={handleCreateReminder}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          <BsCalendarPlus />
          <span>New Reminder</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 border-b border-gray-700">
          <button
            className={`px-4 py-3 font-medium ${
              filter === 'all' 
                ? 'text-white border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              filter === 'upcoming' 
                ? 'text-white border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`px-4 py-3 font-medium ${
              filter === 'completed' 
                ? 'text-white border-b-2 border-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-600 bg-opacity-20 border border-red-600 text-white px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && filteredReminders.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-[#1a202e] rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
            <BsCalendarPlus className="text-4xl text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No reminders found</h3>
          <p className="text-gray-400 mb-4">
            {filter === 'all' 
              ? "You don't have any reminders yet."
              : filter === 'upcoming'
                ? "You don't have any upcoming reminders."
                : "You don't have any completed reminders."}
          </p>
          <button
            onClick={handleCreateReminder}
            className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 transition"
          >
            <BsCalendarPlus />
            <span>Create a new reminder</span>
          </button>
        </div>
      )}

      {!loading && filteredReminders.length > 0 && (
        <div className="bg-[#121620] border border-gray-700 rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {filteredReminders.map(reminder => (
              <li 
                key={reminder._id}
                className={`p-4 hover:bg-[#1a202e] transition ${
                  reminder.completed ? 'bg-gray-800 bg-opacity-30' : 
                  isOverdue(reminder.dueDate) && !reminder.completed ? 'bg-red-900 bg-opacity-20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(reminder)}
                    className={`mt-1 flex-shrink-0 h-6 w-6 rounded-full border ${
                      reminder.completed 
                        ? 'bg-green-600 border-green-600 flex items-center justify-center' 
                        : 'border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {reminder.completed && <BsCheck className="text-white" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleEditReminder(reminder)}
                    >
                      <h3 className={`text-md font-medium ${
                        reminder.completed ? 'text-gray-400 line-through' : 'text-white'
                      }`}>
                        {reminder.title}
                      </h3>
                      
                      <p className={`text-sm ${
                        isOverdue(reminder.dueDate) && !reminder.completed
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}>
                        {formatDate(reminder.dueDate)}
                      </p>
                      
                      {reminder.description && (
                        <p className={`mt-2 text-sm ${
                          reminder.completed ? 'text-gray-500' : 'text-gray-300'
                        }`}>
                          {reminder.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditReminder(reminder)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition"
                      title="Edit"
                    >
                      <BsPencil />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <BsTrash />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ReminderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reminder={selectedReminder}
      />
    </div>
  );
};

export default RemindersPage;
