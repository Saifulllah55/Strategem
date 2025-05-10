import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../Store/features/allUsersSlice";
import { addMembers } from "../Store/features/projectSlice";

const AddMembersModal = ({ projectId, closeModal }) => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { addMembersLoading, addMembersError } = useSelector((state) => state.projects);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const toggleUserSelect = (user) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const filteredUsers = users
    .filter((u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedUsers.some((sel) => sel._id === u._id)
    )
    .slice(0, 5);

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      return;
    }

    const resultAction = await dispatch(addMembers({
      projectId,
      memberIds: selectedUsers.map(user => user._id)
    }));

    if (addMembers.fulfilled.match(resultAction)) {
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1c2331] rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Add Members</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 bg-[#2c323f] border border-[#3a404e] text-white rounded-md"
        />

        {/* Matching Users */}
        {searchTerm && (
          <div className="flex gap-4 mb-4 flex-wrap">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => toggleUserSelect(user)}
                className="flex flex-col items-center cursor-pointer hover:opacity-80"
              >
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="w-12 h-12 rounded-full border-2 border-green-500"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-700 text-white text-lg font-semibold border-2 border-green-500">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm mt-1 text-white">{user.username}</span>
              </div>
            ))}
          </div>
        )}

        {/* Selected Users */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center px-3 py-1 bg-[#2c323f] text-sm rounded-full"
            >
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.username}
                  className="w-5 h-5 rounded-full mr-2"
                />
              ) : (
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-700 text-white text-xs font-bold mr-2">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-white">{user.username}</span>
              <button
                onClick={() => toggleUserSelect(user)}
                className="ml-2 text-red-400 hover:text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {loading && <p className="text-center text-gray-400">Loading users...</p>}
        {error && <p className="text-center text-red-400">Error: {error}</p>}
        {addMembersError && <p className="text-center text-red-400">Error: {addMembersError}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={selectedUsers.length === 0 || addMembersLoading}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
              (selectedUsers.length === 0 || addMembersLoading) && "opacity-50 cursor-not-allowed"
            }`}
          >
            {addMembersLoading ? "Adding..." : "Add Members"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersModal; 