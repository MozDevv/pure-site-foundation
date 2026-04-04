import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { FirestoreChatSidebar } from './FirestoreChatSidebar';
import { FirestoreChatPanel } from './FirestoreChatPanel';
import { FirestoreChatProvider } from '../FirestoreChatContext';

export const FirestoreChatLayout: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <FirestoreChatProvider>
      <div className="h-full flex bg-background">
        <FirestoreChatSidebar className={showSidebar ? '' : 'hidden md:flex'} onSelectRoom={() => setShowSidebar(false)} />
        <FirestoreChatPanel className={!showSidebar ? '' : 'hidden md:flex'} onBack={() => setShowSidebar(true)} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-card border border-border text-foreground',
          }}
        />
      </div>
    </FirestoreChatProvider>
  );
};
