import React from 'react';
import { useFirestoreChat } from '../FirestoreChatContext';

interface TypingIndicatorProps {
  userIds: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userIds,
}) => {
  const { users } = useFirestoreChat();

  if (userIds.length === 0) return null;

  const typingUsers = userIds
    .map((id) => users.find((user) => user.id === id))
    .filter(Boolean)
    .map((user) => user!.name);

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
      <span className="text-sm text-muted-foreground font-medium">
        {getTypingText()}
      </span>
    </div>
  );
};
