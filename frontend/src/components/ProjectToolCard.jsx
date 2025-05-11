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

        {/* <div className="bg-[#303644] rounded-full px-2 py-1">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div
              className={`w-10 h-5 bg-gray-500 peer-checked:bg-[#2d9d78] rounded-full relative transition-colors`}
            >
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div> */}

        <ToggleButton onToggle={onToggle} isEnabled={isEnabled}/>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};

export default ProjectToolCard;
