import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReminder, updateReminder, deleteReminder } from '../Store/features/reminderSlice';

const ReminderModal = ({ isOpen, onClose, reminder }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.reminders);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  
  // Set initial form values if editing an existing reminder
  useEffect(() => {
    if (reminder) {
      setTitle(reminder.title);
      setDescription(reminder.description || '');
      // Format the date for the input
      const dueDateObj = new Date(reminder.dueDate);
      const year = dueDateObj.getFullYear();
      const month = String(dueDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dueDateObj.getDate()).padStart(2, '0');
      const hours = String(dueDateObj.getHours()).padStart(2, '0');
      const minutes = String(dueDateObj.getMinutes()).padStart(2, '0');
      
      setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      resetForm();
    }
  }, [reminder, isOpen]);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setError('');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!dueDate) {
      setError('Due date is required');
      return;
    }
    
    const reminderData = {
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
    };
    
    if (reminder) {
      // Update existing reminder
      dispatch(updateReminder({ id: reminder._id, reminderData }))
        .unwrap()
        .then(() => {
          onClose();
          resetForm();
        })
        .catch(err => {
          setError(err || 'Failed to update reminder');
        });
    } else {
      // Create new reminder
      dispatch(createReminder(reminderData))
        .unwrap()
        .then(() => {
          onClose();
          resetForm();
        })
        .catch(err => {
          setError(err || 'Failed to create reminder');
        });
    }
  };
  
  const handleDelete = () => {
    if (reminder) {
      dispatch(deleteReminder(reminder._id))
        .unwrap()
        .then(() => {
          onClose();
          resetForm();
        })
        .catch(err => {
          setError(err || 'Failed to delete reminder');
        });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#121620] border border-gray-700 p-6 rounded-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-4">
          {reminder ? 'Edit Reminder' : 'Create Reminder'}
        </h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-600 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter reminder title"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
              placeholder="Enter reminder description"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">
              Due Date & Time*
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            
            <div className="flex gap-2">
              {reminder && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  disabled={loading}
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                disabled={loading}
              >
                {loading ? 'Saving...' : reminder ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;
