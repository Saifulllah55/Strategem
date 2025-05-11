import React from "react";

function ToggleButton({ onToggle, isEnabled }) {
  return (
    <button
      onClick={onToggle}
      className={`w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
        isEnabled ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
          isEnabled ? "translate-x-8" : "translate-x-0"
        }`}
      ></div>
    </button>
  );
}

export default ToggleButton;
