import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { fetchProjectAnnouncements, createAnnouncement } from '../../Store/features/announcementSlice';

const MessageBoard = ({ projectId }) => {
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const dispatch = useDispatch();
  const { byId: announcementsById, allIds: announcementIds, fetchLoading, createLoading } = useSelector((state) => state.announcements);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectAnnouncements(projectId));
    }
  }, [dispatch, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    try {
      await dispatch(createAnnouncement({
        projectId,
        text: newAnnouncement
      }));
      setNewAnnouncement('');
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const announcements = announcementIds.map(id => announcementsById[id]);

  return (
    <div className="p-6 bg-[#121620] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-6">Message Board</h2>
        
        {/* Create Announcement Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Write an announcement..."
            className="w-full h-32 bg-[#1c2331] text-white p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={createLoading}
            className={`mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${
              createLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {createLoading ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>

        {/* Announcements List */}
        {fetchLoading ? (
          <div className="text-white text-center">Loading announcements...</div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement._id} className="bg-[#1c2331] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-medium">
                      {announcement.announcer.name}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {format(new Date(announcement.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                </div>
                <p className="text-white">{announcement.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBoard;
