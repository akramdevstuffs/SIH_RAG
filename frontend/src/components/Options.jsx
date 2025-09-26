import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useFileContext } from '../hooks/useFileContext';
import { FileInput } from './FileUpload';

export default function Options({ showOptions, setShowOptions }) {
  const { files, setFiles, uploading } = useFileContext();
  const inputRef = useRef(null);

  function handleFileSelect(e) {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files).map((file, index) => ({
      file,
      progress: Math.floor(Math.random() * 100), // Random progress for demo
      uploaded: false,
      id: Date.now() + index, // Better unique ID generation
    }));

    setFiles([...files, ...newFiles]);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setShowOptions(false);
  }

  if (!showOptions) return null;

  return (
    <div className="absolute top-full left-full ml-4 -mt-12 w-48 rounded-md bg-neutral-800 shadow-lg z-10">
      <div className="py-1 pr-8">
        <FileInput
          inputRef={inputRef}
          disabled={uploading}
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
}
