import React, { useState } from 'react';
import { FileContext } from '../context/FileContext';

export function FileProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Add a helper function to add files with proper ordering (newer files first)
  const addFiles = (newFiles) => {
    setFiles(prevFiles => [...newFiles, ...prevFiles]);
  };

  // Add a helper function to remove a file
  const removeFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  return (
    <FileContext.Provider value={{ 
      files, 
      setFiles, 
      addFiles,
      removeFile,
      uploading, 
      setUploading 
    }}>
      {children}
    </FileContext.Provider>
  );
}