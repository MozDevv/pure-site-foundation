import React from 'react';
import { Toaster } from 'react-hot-toast';
import { FirestoreChatSidebar } from './FirestoreChatSidebar';
import { FirestoreChatPanel } from './FirestoreChatPanel';
import { FirestoreChatProvider } from '../FirestoreChatContext';

export const FirestoreChatLayout: React.FC = () => {
  return (
    <FirestoreChatProvider>
      <div className="h-full flex bg-background">
        <FirestoreChatSidebar />
        <FirestoreChatPanel />
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
