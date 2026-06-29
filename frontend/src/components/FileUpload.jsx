import React, { useRef, useState } from "react";
import { FileAudio2, FileImage, FileText, FileVideo, Upload, X, Trash2, Plus } from "lucide-react";
import { useFileContext } from "../hooks/useFileContext";
import { uploadFile, getFileStatus } from "../api";

function FileUpload({ expanded = true }) {
  const { files, setFiles, uploading, setUploading } = useFileContext();
  const { addFiles } = useFileContext();
  const inputRef = useRef(null);

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);

    await Promise.all(
      files.map(async (fileWithProgress) => {
        // Skip already uploaded or processing files
        if (fileWithProgress.uploaded) return;

        try {
          // Immediately set status to uploading before starting API call
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithProgress.id
                ? {
                    ...f,
                    status: "uploading",
                    progress: 10,
                  }
                : f
            )
          );

          // Upload file
          const result = await uploadFile(fileWithProgress.file);

          // result should contain file_id
          const fileId = result.file_id;

          // Show upload complete & transition to pending
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithProgress.id
                ? {
                    ...f,
                    progress: 100,
                    uploaded: true,
                    fileId,
                    status: "pending",
                  }
                : f
            )
          );

          // Poll backend until ingestion finishes (processed or error)
          let finished = false;

          while (!finished) {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const statusRes = await getFileStatus(fileId);
            const currentStatus = statusRes.status;

            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileWithProgress.id
                  ? {
                      ...f,
                      status: currentStatus,
                    }
                  : f
              )
            );

            if (
              currentStatus === "processed" ||
              currentStatus === "error"
            ) {
              finished = true;
            }
          }
        } catch (err) {
          console.error("Upload or polling failed:", err);

          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileWithProgress.id
                ? {
                    ...f,
                    status: "error",
                    progress: 0,
                  }
                : f
            )
          );
        }
      })
    );

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
        expanded={expanded}
      />
      <ActionButtons
        disabled={files.length === 0 || uploading}
        onUpload={handleUpload}
        onClear={handleClearAll}
        expanded={expanded}
      />
    </div>
  );
}

function FileInput({ inputRef, disabled, onFileSelect, expanded = true }) {
  return (
    <div className="relative group w-full">
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
        className={`w-full flex cursor-pointer items-center space-x-2 px-3 py-2 hover:bg-neutral-800 rounded-md transition-all duration-200 bg-neutral-900 border border-neutral-800 text-white ${
          expanded ? 'justify-start' : 'justify-center'
        }`}
        onClick={() => inputRef.current && inputRef.current.click()}
        disabled={disabled}
      >
        <Plus className="text-white flex-shrink-0" size={18} />
        {expanded && <span className="text-sm font-medium">Select Items</span>}
      </button>

      {/* Tooltip for collapsed state */}
      {!expanded && !disabled && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-neutral-900 border border-neutral-700 text-white text-xs rounded py-1.5 px-3 z-50 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-xl">
          Select Items
        </div>
      )}
    </div>
  );
}

function ActionButtons({ onUpload, onClear, disabled, expanded = true }) {
  return (
    <div className={`space-y-2 ${expanded ? '' : 'flex flex-col items-center'}`}>
      <div className="relative w-full group">
        <button
          onClick={onUpload}
          disabled={disabled}
          className={`w-full flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 disabled:bg-neutral-950 disabled:opacity-40 disabled:border-neutral-900 text-white rounded-md transition-colors ${
            expanded ? 'justify-start' : 'justify-center'
          }`}
        >
          <Upload className="flex-shrink-0" size={18} />
          {expanded && <span className="text-sm font-medium">Upload</span>}
        </button>
        {/* Tooltip for collapsed state */}
        {!expanded && !disabled && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-neutral-900 border border-neutral-700 text-white text-xs rounded py-1.5 px-3 z-50 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-xl">
            Upload Files
          </div>
        )}
      </div>

      <div className="relative w-full group">
        <button
          onClick={onClear}
          className={`w-full flex items-center gap-2 px-3 py-2 bg-red-950 hover:bg-red-900 border border-red-900/50 disabled:bg-neutral-950 disabled:opacity-40 disabled:border-neutral-900 text-red-200 rounded-md transition-colors ${
            expanded ? 'justify-start' : 'justify-center'
          }`}
          disabled={disabled}
        >
          <Trash2 className="flex-shrink-0 text-red-400" size={18} />
          {expanded && <span className="text-sm font-medium">Clear All</span>}
        </button>
        {/* Tooltip for collapsed state */}
        {!expanded && !disabled && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-neutral-900 border border-neutral-700 text-white text-xs rounded py-1.5 px-3 z-50 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-xl">
            Clear All
          </div>
        )}
      </div>
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
    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden mt-1">
      <div 
        className="h-full bg-blue-500 transition-all duration-300 ease-in-out" 
        style={{width: `${progress}%`}}
      ></div>
    </div>
  );
}

function FileItem({ file, onRemove, uploading, expanded = true }) {
  const Icon = getFileIcon(file.file.type);
  
  if (!expanded) {
    return (
      <div className="relative flex items-center justify-center p-2.5 bg-neutral-900 border border-neutral-800/80 hover:bg-neutral-800 rounded-md mb-2 group cursor-pointer transition-colors duration-150">
        <Icon size={16} className="text-neutral-400" />
        
        {/* Compact Status Indicator */}
        {file.status && (
          <div className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-neutral-900 ${
            file.status === 'uploading' ? 'bg-blue-500 animate-pulse' :
            file.status === 'pending' ? 'bg-yellow-500' :
            file.status === 'processing' ? 'bg-amber-500 animate-pulse' :
            file.status === 'processed' ? 'bg-emerald-500' :
            'bg-rose-500'
          }`} />
        )}

        {/* Hover Tooltip showing Name and Status */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-neutral-900 border border-neutral-700 text-white text-xs rounded py-2 px-3 z-50 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-xl flex flex-col gap-0.5">
          <span className="font-semibold">{file.file.name}</span>
          {file.status && <span className="capitalize text-[10px] text-gray-400">Status: {file.status}</span>}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 rounded-md p-3 border transition-colors ${file.uploaded ? 'bg-neutral-950/80 border-neutral-800/80' : 'bg-neutral-900 border-neutral-800'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Icon size={20} className="text-neutral-400 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-white text-sm font-medium truncate">{file.file.name}</span>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
              <span>{(file.file.size / 1024).toFixed(1)} KB</span>
              {file.status && (
                <>
                  <span>•</span>
                  <span className={`capitalize font-semibold text-[11px] ${
                    file.status === 'uploading' ? 'text-blue-400' :
                    file.status === 'pending' ? 'text-yellow-400 animate-pulse' :
                    file.status === 'processing' ? 'text-amber-400 animate-pulse' :
                    file.status === 'processed' ? 'text-emerald-400' :
                    'text-rose-400'
                  }`}>{file.status}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {!uploading && (
          <button 
            onClick={() => onRemove(file.id)} 
            className="bg-none hover:bg-neutral-800 rounded p-1 text-neutral-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        )}
      </div>
      {!file.uploaded && file.status === 'uploading' && <ProgressBar progress={file.progress || 0} />}
    </div>
  );
}

// This is the FileList component that Sidebar will import
function FileList({ files, onRemove, uploading, expanded = true }) {
  if (files.length === 0) return null;
  
  return (
    <div className="flex flex-col h-full">
      {expanded && (
        <div className="px-3 py-2 flex-shrink-0">
          <h3 className="font-semibold text-neutral-200 text-sm">
            Selected Items ({files.length})
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-3 space-y-2">
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