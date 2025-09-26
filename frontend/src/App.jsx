import React from 'react';
import { Sidebar } from './components/Sidebar';
import { FileProvider } from './components/FileProvider';

function App() {
  return (
    <FileProvider>
      <div className='flex h-screen '>
        <Sidebar />
        <div className='flex-1 flex items-center justify-center'>
          <h1 className='text-4xl font-mono text-black'>SIH RAG</h1>
        </div>
      </div>
    </FileProvider>
  );
}

export default App;