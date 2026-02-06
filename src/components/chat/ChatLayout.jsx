import { ChatProvider } from './ChatContext';
import { ChatPanel } from './ChatPanel';
import { ChatSidebar } from './ChatSidebar';

export const ChatLayout = () => {
  return (
    <div className="h-full flex">
      <ChatProvider>
        <ChatSidebar />
        <ChatPanel />
      </ChatProvider>
    </div>
  );
};
