import React, { useState } from "react";
import { ChevronFirst, ChevronLast, Database } from "lucide-react";
import { useFileContext } from "../hooks/useFileContext";
import { FileUpload, FileList } from "./FileUpload";

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const { files, removeFile, uploading } = useFileContext();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <aside className={`h-screen transition-all duration-300 ease-in-out flex-shrink-0 ${expanded ? 'w-80' : 'w-16'}`}>
      <nav className="h-full flex flex-col bg-[#0b0c0e] border-r border-neutral-800/80 shadow-2xl relative">
        {/* Header Section */}
        <div className="p-4 flex justify-between items-center border-b border-neutral-900/60 flex-shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "w-48 opacity-100" : "w-0 opacity-0"}`}>
            <Database className="text-blue-500 flex-shrink-0" size={20} />
            <span className="text-white font-semibold text-base tracking-wider whitespace-nowrap bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
              Syn Search
            </span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-all duration-200 flex-shrink-0"
          >
            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        {/* Scrollable middle area (FileList) */}
        <div className="flex-1 min-h-0 overflow-hidden py-3">
          <div className="h-full overflow-y-auto scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800 hover:scrollbar-thumb-neutral-700">
            <FileList 
              files={files} 
              onRemove={removeFile} 
              uploading={uploading} 
              expanded={expanded} 
            />
          </div>
        </div>

        {/* Bottom Upload Section */}
        <div className="p-3 border-t border-neutral-900/60 bg-neutral-950/40 flex-shrink-0">
          <FileUpload expanded={expanded} />
        </div>
      </nav>

      <style jsx>{`
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thumb-neutral-800::-webkit-scrollbar-thumb {
          background-color: #262626;
          border-radius: 9999px;
        }
        
        .hover\\:scrollbar-thumb-neutral-700::-webkit-scrollbar-thumb:hover {
          background-color: #404040;
        }
        
        /* Firefox scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #262626 transparent;
        }
      `}</style>
    </aside>
  );
}