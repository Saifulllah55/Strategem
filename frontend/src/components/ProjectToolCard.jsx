import React from "react";
import ToggleButton from "./ToggleButton";

const ProjectToolCard = ({ title, icon, description, isEnabled, onToggle }) => {
  return (
    <div className="bg-[#1c2331] border border-[#3a404e] rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="mr-2 text-xl">{icon}</span>
          <h3 className="font-medium text-white">{title}</h3>
        </div>

        <ToggleButton onToggle={onToggle} isEnabled={isEnabled}/>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};

export default ProjectToolCard;