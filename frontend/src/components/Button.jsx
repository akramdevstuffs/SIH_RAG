  import React, { useState, useRef, useEffect } from "react";
  import { Plus } from "lucide-react";
  import Options from "./Options";

  export default function Button({ text, expanded }) {
    const [showOptions, setShowOptions] = useState(false);
    const buttonRef = useRef(null);

    const handleClick = () => {
      setShowOptions(!showOptions);
    };

    // Close options menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (buttonRef.current && !buttonRef.current.contains(event.target)) {
          setShowOptions(false);
        }
      };

      if (showOptions) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showOptions]);

    return (
      <div className="relative" ref={buttonRef}>
        <div
          onClick={handleClick}
          className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-all duration-200 group hover:bg-neutral-600 text-white hover:scale-105 active:scale-95`}
        >
          <Plus className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${showOptions ? 'rotate-45' : 'rotate-0'}`} />
          
          <span 
            className={`overflow-hidden transition-all duration-200 ease-out whitespace-nowrap ${
              expanded ? "max-w-xs ml-3 opacity-100" : "max-w-0 ml-0 opacity-0"
            }`}
          >
            {text}
          </span>
          
          {!expanded && (
            <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-neutral-800 text-white text-sm whitespace-nowrap transition-all duration-200 z-50 ${
              showOptions 
                ? "invisible opacity-0 -translate-x-3 scale-95" 
                : "invisible opacity-0 -translate-x-3 scale-95 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100"
            }`}>
              {text}
            </div>
          )}
        </div>

        {/* Options Menu with Animation */}
        <div className={`transition-all duration-300 ease-out transform-gpu ${
          showOptions 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}>
          <Options showOptions={showOptions} setShowOptions={setShowOptions} />
        </div>
      </div>
    );
  }