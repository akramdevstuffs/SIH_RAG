import React, { useRef, useState } from "react";
import { FileAudio2, FileImage, FileText, FileVideo, Upload, X, Trash2, Plus } from "lucide-react";
import { useFileContext } from "../hooks/useFileContext";
import axios from 'axios';

function FileUpload() {
  const { files, setFiles, uploading, setUploading } = useFileContext();
  const { addFiles } = useFileContext();
  const inputRef = useRef(null);

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);

    const uploadPromises = files.map(async (fileWithProgress) => {
      const formData = new FormData();
      formData.append("file", fileWithProgress.file);
      try {
        await axios.post('https://httpbin.org/post', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === fileWithProgress.id ? { ...f, progress } : f
              )
            );
          }
        });
        
        // Mark file as uploaded
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileWithProgress.id ? { ...f, progress: 100, uploaded: true } : f
          )
        );
      } catch (error) {
        console.log(error);
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
  }

  function handleClearAll() {
    setFiles([]);
  }

  function handleFileSelect(event) {
    if (!event.target.files?.length) return;
    
    // Create base timestamp
    const baseTimestamp = Date.now();
    
    const newFiles = Array.from(event.target.files).map((file, index) => ({ 
      // Use reverse index to ensure the first selected file gets the highest ID
      // This way when we prepend to the array, they maintain selection order
      id: baseTimestamp + (event.target.files.length - index), 
      file,
      progress: 0,
      uploaded: false
    }));
    
    // Use the context's addFiles function which ensures newer files appear first
    addFiles(newFiles);
    
    // Reset input so same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <FileInput
        inputRef={inputRef}
        disabled={uploading}
        onFileSelect={handleFileSelect}
      />
      <ActionButtons
        disabled={files.length === 0 || uploading}
        onUpload={handleUpload}
        onClear={handleClearAll}
      />
    </div>
  );
}

function FileInput({ inputRef, disabled, onFileSelect }) {
  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileSelect}
        disabled={disabled}
        className="hidden"
        multiple // Allow multiple file selection
      />
      <button
        type="button"
        className="w-full flex cursor-pointer items-center justify-center space-x-2 px-3 py-2 hover:bg-neutral-600 rounded-md transition-colors duration-200 bg-black text-white"
        onClick={() => inputRef.current && inputRef.current.click()}
        disabled={disabled}
      >
        <span className="flex items-center gap-2">
           <Plus className="text-white" size={18} />
           Select Items
           </span>
      </button>
    </div>
  );
}

function ActionButtons({ onUpload, onClear, disabled }) {
  return (
    <div className="space-y-2">
      <button
        onClick={onUpload}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black hover:bg-neutral-600 disabled:bg-gray-600 text-white rounded-md transition-colors"
      >
        <Upload size={18} />
        Upload
      </button>
      <button
        onClick={onClear}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
        disabled={disabled}
      >
        <Trash2 size={18} />
        Clear All
      </button>
    </div>
  );
}

const getFileIcon = (mimeType) => {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.startsWith("audio/")) return FileAudio2;
  if (mimeType === "application/pdf") return FileText;
  return FileText; // Default icon
};

function ProgressBar({ progress }) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gray-300 transition-all duration-300 ease-in-out" 
        style={{width: `${progress}%`}}
      ></div>
    </div>
  );
}

function FileItem({ file, onRemove, uploading, expanded = true }) {
  const Icon = getFileIcon(file.file.type);
  
  if (!expanded) {
    return (
      <div className="flex items-center justify-center p-2 bg-neutral-800 hover:bg-gray-600 rounded-md mb-2">
        <Icon size={16} className="text-neutral-400" />
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 rounded-md p-4 ${file.uploaded ? 'bg-black' : 'bg-neutral-800'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-neutral-400" />
          <div className="flex flex-col">
            <span className="text-white">{file.file.name}</span>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>•</span>
              <span>{file.file.type || 'Unknown type'}</span>
            </div>
          </div>
        </div>
        {!uploading && (
          <button 
            onClick={() => onRemove(file.id)} 
            className="bg-none hover:bg-gray-600 rounded p-1"
          >
            <X size={16} className="text-white" />
          </button>
        )}
      </div>
      {!file.uploaded && <ProgressBar progress={file.progress || 0} />}
    </div>
  );
}

// This is the FileList component that Sidebar will import
// IMPORTANT: This needs to accept the `expanded` prop from Sidebar
function FileList({ files, onRemove, uploading, expanded = true }) {
  if (files.length === 0) return null;
  
  return (
    <div className="flex flex-col h-full">
      {expanded && (
        <div className="px-2 py-2 flex-shrink-0">
          <h3 className="font-semibold text-white text-sm">
            Files ({files.length}):
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-2 space-y-2">
        {files.map((file) => (
          <FileItem 
            key={file.id}
            file={file}
            onRemove={onRemove}
            uploading={uploading}
            expanded={expanded}
          />
        ))}
      </div>
    </div>
  );
}

export { FileUpload, FileList, FileInput };