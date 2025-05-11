import React from "react";

const ProjectUserRow = ({ user, isSelected, onToggle }) => {
  const initials = user.username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center space-x-4">
      <input
        type="checkbox"
        id={`user-${user.id}`}
        checked={isSelected}
        onChange={onToggle}
        className="accent-[#2d9d78] border border-gray-500 rounded"
      />

      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#3a404e] text-xs text-white font-medium">
        {initials}
      </div>

      <div className="flex-grow">
        <div className="flex items-center">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <span className="text-xs text-gray-400 ml-2">{user.role}</span>
        </div>
        <p className="text-xs text-gray-400">{user.email}</p>
      </div>
    </div>
  );
};

export default ProjectUserRow;
