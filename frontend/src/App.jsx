import React from 'react';
import { Sidebar } from './components/Sidebar';
import { FileProvider } from './components/FileProvider';
import ChatArea from './components/ChatArea';

function App() {
  return (
    <FileProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <ChatArea />
        </div>
      </div>
    </FileProvider>
  );
}

export default App;
