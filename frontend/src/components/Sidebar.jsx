import React from "react";
import { useState, useRef } from "react";
import { ChevronFirst, ChevronLast, Folder, FolderOpen, File, ChevronRight, Plus, MoreVertical } from "lucide-react";
import { useFileContext } from "../hooks/useFileContext";
import Button from "./Button";
import axios from "axios";

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const { files, removeFile, uploading, addFiles } = useFileContext();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleFileSelect = (event, parentPath = '') => {
    if (!event.target.files?.length) return;
    
    const baseTimestamp = Date.now();
    
    const newFiles = Array.from(event.target.files).map((file, index) => ({ 
      id: baseTimestamp + (event.target.files.length - index), 
      file,
      progress: 0,
      uploaded: false,
      path: parentPath ? `${parentPath}/${file.name}` : (file.webkitRelativePath || file.name),
      type: 'file'
    }));
    
    addFiles(newFiles);
  };

  const handleFolderSelect = (event, parentPath = '') => {
    if (!event.target.files?.length) return;
    
    const baseTimestamp = Date.now();
    
    const newFiles = Array.from(event.target.files).map((file, index) => ({ 
      id: baseTimestamp + (event.target.files.length - index), 
      file,
      progress: 0,
      uploaded: false,
      path: parentPath ? `${parentPath}/${file.webkitRelativePath}` : file.webkitRelativePath,
      type: 'file'
    }));
    
    addFiles(newFiles);
  };



  return (
    <aside className={`h-screen transition-all duration-300 ease-in-out flex-shrink-0 ${expanded ? 'w-80' : 'w-16'}`}>
      <nav className="h-full flex flex-col bg-black border-r border-neutral-600 shadow-sm">
        {/* Fixed Header */}
        <div className="p-4 pb-2 flex justify-between items-center flex-shrink-0">
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "w-32 opacity-100" : "w-0 opacity-0"}`}>
            <span className="text-white font-medium  text-xl whitespace-nowrap">
              Syn Search
            </span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-white hover:bg-neutral-600 transition-all duration-200 flex-shrink-0"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>
        
        {/* Fixed Add Item Button */}
        <div className="px-3 flex-shrink-0">
          <SelectItemButton 
            onFileSelect={(e) => handleFileSelect(e)}
            onFolderSelect={(e) => handleFolderSelect(e)}
            disabled={uploading}
            expanded={expanded}
          />
        </div>
        
        {/* Scrollable File List with Custom Scrollbar */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-600 hover:scrollbar-thumb-neutral-500">
            <NestedFileList 
              files={files} 
              onRemove={removeFile}
              onFileSelect={handleFileSelect}
              onFolderSelect={handleFolderSelect}
              uploading={uploading}
              expanded={expanded}
            />
          </div>
        </div>
        
        {/* Fixed Upload and Clear Buttons at Bottom */}
        <div className="px-3 pb-4 flex-shrink-0 mt-4">
          <UploadActions expanded={expanded} />
        </div>
      </nav>
      
      <style jsx>{`
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thumb-neutral-600::-webkit-scrollbar-thumb {
          background-color: #525252;
          border-radius: 3px;
        }
        
        .hover\\:scrollbar-thumb-neutral-500::-webkit-scrollbar-thumb:hover {
          background-color: #737373;
        }
        
        /* Firefox scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #525252 transparent;
        }
      `}</style>
    </aside>
  );
}

// Enhanced Select item button component
function SelectItemButton({ onFileSelect, onFolderSelect, disabled, expanded }) {
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef();
  const folderInputRef = useRef();
  const buttonRef = useRef();

  const handleFileClick = () => {
    fileInputRef.current?.click();
    setShowOptions(false);
  };

  const handleFolderClick = () => {
    folderInputRef.current?.click();
    setShowOptions(false);
  };

  // Close options when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={buttonRef}>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={onFileSelect}
        className="hidden"
        disabled={disabled}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        onChange={onFolderSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Main button */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled}
        className={`group w-full flex items-center gap-2 px-3 py-2 bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-700 disabled:opacity-50 text-white rounded-md transition-all duration-200 relative ${
          expanded ? 'justify-start' : 'justify-center'
        }`}
      >
        <Plus className="w-4 h-4 flex-shrink-0" />
        <span className={`transition-all duration-300 whitespace-nowrap ${
          expanded ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 ml-0 overflow-hidden'
        }`}>
          Add Item
        </span>

        {/* Tooltip for collapsed state */}
        <div className={`absolute left-full rounded-md px-2 py-1 ml-2 bg-neutral-600 text-white text-sm z-20 whitespace-nowrap transition-all duration-200 ${
          !expanded && !disabled ? 'opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0' : 'opacity-0 invisible'
        }`}>
          Add Item
        </div>
      </button>

      {/* Options menu with animations */}
      <div className={`absolute ${expanded ? 'left-full ml-2' : 'left-full ml-2'} top-0 bg-neutral-600 border border-neutral-500 rounded-md shadow-lg z-30 min-w-40 transition-all duration-200 origin-top-left ${
        showOptions 
          ? 'opacity-100 visible scale-100 translate-y-0' 
          : 'opacity-0 invisible scale-95 -translate-y-2'
      }`}>
        <button
          onClick={handleFileClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-neutral-500 rounded-t-md transition-colors duration-150"
        >
          <File className="w-4 h-4" />
          <span className="text-sm">Select Files</span>
        </button>
        <button
          onClick={handleFolderClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-neutral-500 rounded-b-md transition-colors duration-150 border-t border-neutral-500"
        >
          <Folder className="w-4 h-4" />
          <span className="text-sm">Select Folder</span>
        </button>
      </div>
    </div>
  );
}

// Enhanced context menu component
function ContextMenu({ x, y, visible, onClose, onAddFiles, onAddFolder, folderPath }) {
  const menuRef = useRef();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed bg-neutral-600 border border-neutral-500 rounded-md shadow-lg z-50 min-w-40"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => {
          onAddFiles();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-neutral-500 rounded-t-md transition-colors duration-150"
      >
        <File className="w-4 h-4" />
        <span className="text-sm">Add Files</span>
      </button>
      <button
        onClick={() => {
          onAddFolder();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-neutral-500 rounded-b-md transition-colors duration-150 border-t border-neutral-500"
      >
        <Folder className="w-4 h-4" />
        <span className="text-sm">Add Folder</span>
      </button>
    </div>
  );
}

// Enhanced nested file list component with context menu support
function NestedFileList({ files, onRemove, onFileSelect, onFolderSelect, uploading, expanded }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, folderPath: '' });
  const fileInputRef = useRef();
  const folderInputRef = useRef();
  
  // Build nested structure
  const buildNestedStructure = (files) => {
    const structure = {};
    
    files.forEach(file => {
      const pathParts = file.path.split('/');
      let current = structure;
      
      // Build the nested structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {
            type: 'folder',
            children: {},
            name: part,
            path: pathParts.slice(0, i + 1).join('/')
          };
        }
        current = current[part].children;
      }
      
      // Add the file (skip placeholder files in display)
      const fileName = pathParts[pathParts.length - 1];
      if (!file.isPlaceholder) {
        current[fileName] = {
          ...file,
          type: 'file',
          name: fileName
        };
      }
    });
    
    return structure;
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const handleContextMenu = (e, folderPath) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      folderPath: folderPath
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, folderPath: '' });
  };

  const handleAddFiles = (folderPath) => {
    fileInputRef.current.setAttribute('data-folder-path', folderPath);
    fileInputRef.current.click();
  };

  const handleAddFolder = (folderPath) => {
    folderInputRef.current.setAttribute('data-folder-path', folderPath);
    folderInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    const folderPath = e.target.getAttribute('data-folder-path');
    onFileSelect(e, folderPath);
    e.target.value = ''; // Reset input
  };

  const handleFolderInputChange = (e) => {
    const folderPath = e.target.getAttribute('data-folder-path');
    onFolderSelect(e, folderPath);
    e.target.value = ''; // Reset input
  };

  const renderItem = (item, key, depth = 0) => {
    const indentStyle = { paddingLeft: `${depth * 16 + 8}px` };
    
    if (item.type === 'folder') {
      const isExpanded = expandedFolders.has(item.path);
      
      return (
        <div key={key}>
          <div 
            className="flex items-center justify-between py-2 px-2 hover:bg-neutral-600 cursor-pointer text-white transition-colors duration-150 group"
            style={indentStyle}
            onClick={() => toggleFolder(item.path)}
            onContextMenu={(e) => handleContextMenu(e, item.path)}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </div>
              {isExpanded ? <FolderOpen className="w-4 h-4 flex-shrink-0" /> : <Folder className="w-4 h-4 flex-shrink-0" />}
              <span className={`truncate text-sm transition-all duration-300 ${
                expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
              }`}>
                {item.name}
              </span>
            </div>
            
            {/* Add button for folders */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, item.path);
              }}
              className={`p-1 hover:bg-neutral-500 rounded text-neutral-400 hover:text-white transition-all duration-150 flex-shrink-0 ${
                expanded ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
              }`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className={`overflow-hidden transition-all duration-200 ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {Object.entries(item.children).map(([childKey, child]) => 
              renderItem(child, `${key}-${childKey}`, depth + 1)
            )}
          </div>
        </div>
      );
    } else {
      // File item - Fixed progress bar display
      const progressBarVisible = item.progress > 0 && item.progress < 100;
      const isUploaded = item.uploaded || item.progress === 100;
      const hasFailed = item.uploadFailed;
      
      return (
        <div key={key} className="flex items-center justify-between py-2 px-2 hover:bg-neutral-600 text-white transition-colors duration-150 group" style={indentStyle}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <File className="w-4 h-4 flex-shrink-0" />
            <div className={`min-w-0 flex-1 transition-all duration-300 ${
              expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
            }`}>
              <div className={`text-sm truncate ${isUploaded ? 'text-green-400' : hasFailed ? 'text-red-400' : ''}`}>
                {item.name}
              </div>
              <div className="text-xs text-neutral-400 truncate">
                {(item.file.size / 1024).toFixed(1)} KB
              </div>
              {progressBarVisible && (
                <div className="w-full bg-neutral-700 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            disabled={uploading}
            className={`p-1 hover:bg-neutral-500 rounded text-neutral-400 hover:text-white transition-all duration-150 disabled:opacity-50 flex-shrink-0 ${
              expanded ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }
  };

  const nestedStructure = buildNestedStructure(files);

  return (
    <div className="py-2">
      {/* Hidden file inputs for context menu actions */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={uploading}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        onChange={handleFolderInputChange}
        className="hidden"
        disabled={uploading}
      />
      
      {Object.entries(nestedStructure).map(([key, item]) => 
        renderItem(item, key)
      )}
      {files.length === 0 && (
        <div className={`text-neutral-400 text-sm p-4 text-center transition-all duration-300 ${
          expanded ? 'opacity-100' : 'opacity-0'
        }`}>
          No files selected
        </div>
      )}

      {/* Context Menu */}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        onClose={closeContextMenu}
        onAddFiles={() => handleAddFiles(contextMenu.folderPath)}
        onAddFolder={() => handleAddFolder(contextMenu.folderPath)}
        folderPath={contextMenu.folderPath}
      />
    </div>
  );
}

// Upload actions component with improved error handling
function UploadActions({ expanded }) {
  const { files, setFiles, uploading, setUploading } = useFileContext();
  const uploadEndpoint = 'https://httpbin.org/post';

  async function handleUpload() {
    if (files.length === 0) return;
    
    setUploading(true);

    // Reset all progress and upload states (exclude placeholder files)
    setFiles(prevFiles => 
      prevFiles.map(f => ({ 
        ...f, 
        progress: f.isPlaceholder ? f.progress : 0, 
        uploaded: f.isPlaceholder ? f.uploaded : false, 
        uploadFailed: f.isPlaceholder ? f.uploadFailed : false 
      }))
    );

    // Only upload real files, not placeholders
    const realFiles = files.filter(f => !f.isPlaceholder);
    
    const uploadPromises = realFiles.map(async (fileWithProgress) => {
      const formData = new FormData();
      formData.append("file", fileWithProgress.file);
      formData.append("path", fileWithProgress.path);
      
      try {
        console.log(`Starting upload for: ${fileWithProgress.path}`);
        
        const response = await axios.post(uploadEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
            console.log(`Upload progress for ${fileWithProgress.path}: ${progress}%`);
            
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === fileWithProgress.id ? { ...f, progress, uploadFailed: false } : f
              )
            );
          }
        });
        
        // Mark file as uploaded
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileWithProgress.id ? { ...f, progress: 100, uploaded: true, uploadFailed: false } : f
          )
        );
        
        console.log(`Successfully uploaded ${fileWithProgress.path}:`, response.data);
        return { success: true, file: fileWithProgress.path };
      } catch (error) {
        console.error(`Failed to upload ${fileWithProgress.path}:`, error);
        
        // Mark file as failed
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileWithProgress.id ? { ...f, progress: 0, uploadFailed: true, uploaded: false } : f
          )
        );
        return { success: false, file: fileWithProgress.path, error };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      console.log(`Upload completed: ${successCount} successful, ${failCount} failed`);
    } catch (error) {
      console.error('Upload batch failed:', error);
    } finally {
      setUploading(false);
    }
  }

  function handleClearAll() {
    if (!uploading) {
      setFiles([]);
    }
  }

  const realFiles = files.filter(f => !f.isPlaceholder);
  const uploadedCount = realFiles.filter(f => f.uploaded).length;
  const failedCount = realFiles.filter(f => f.uploadFailed).length;

  return (
    <div className="space-y-2">
      <button
        onClick={handleUpload}
        disabled={realFiles.length === 0 || uploading}
        className={`w-full flex items-center gap-2 px-3 py-2 bg-black hover:bg-neutral-600 disabled:bg-neutral-700 disabled:opacity-50 text-white rounded-md transition-all duration-200 ${
          expanded ? 'justify-start' : 'justify-center'
        } group relative`}
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className={`transition-all duration-300 whitespace-nowrap ${
          expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
        }`}>
          {uploading ? 'Uploading...' : 'Upload'}
        </span>
        
        {/* Tooltip for collapsed state */}
        <div className={`absolute left-full rounded-md px-2 py-1 ml-2 bg-neutral-600 text-white text-sm z-20 whitespace-nowrap transition-all duration-200 ${
          !expanded && !(realFiles.length === 0 || uploading) ? 'opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0' : 'opacity-0 invisible'
        }`}>
          {uploading ? 'Uploading...' : 'Upload'}
        </div>
      </button>
      
      <button
        onClick={handleClearAll}
        disabled={files.length === 0 || uploading}
        className={`w-full flex items-center gap-2 px-3 py-2 bg-black hover:bg-neutral-600 disabled:bg-neutral-700 disabled:opacity-50 text-white rounded-md transition-all duration-200 ${
          expanded ? 'justify-start' : 'justify-center'
        } group relative`}
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span className={`transition-all duration-300 whitespace-nowrap ${
          expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
        }`}>
          Clear All
        </span>
        
        {/* Tooltip for collapsed state */}
        <div className={`absolute left-full rounded-md px-2 py-1 ml-2 bg-neutral-600 text-white text-sm z-20 whitespace-nowrap transition-all duration-200 ${
          !expanded && !(files.length === 0 || uploading) ? 'opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-1 group-hover:translate-x-0' : 'opacity-0 invisible'
        }`}>
          Clear All
        </div>
      </button>
    </div>
  );
}