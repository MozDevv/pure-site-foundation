import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFirestoreChat } from '../FirestoreChatContext';
import { getInitials } from './FirestoreChatSidebar';

interface FirestoreMessageBubbleProps {
  message: ChatMessage;
  showAvatar: boolean;
  isOwn: boolean;
}

export const FirestoreMessageBubble: React.FC<FirestoreMessageBubbleProps> = ({
  message,
  showAvatar,
  isOwn,
}) => {
  const { users, currentUser } = useFirestoreChat();

  const sender = users.find((user) => user.id === message.senderId);
  const isDelivered = message.readBy.length > 1;
  const isRead = message.readBy.some((id) => id !== message.senderId);

  function getMessageStatus() {
    if (!isOwn) return null;

    if (isRead) {
      return <CheckCheck className="w-3 h-3 text-primary" />;
    } else if (isDelivered) {
      return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
    } else {
      return <Check className="w-3 h-3 text-muted-foreground" />;
    }
  }

  return (
    <div
      className={cn(
        'flex gap-3 group transition-all duration-200 rounded-lg p-2 -mx-2',
        isOwn && 'flex-row-reverse',
        !showAvatar && 'mt-1'
      )}
    >
      {/* Avatar */}
      <div className={cn('flex-shrink-0 w-8', !showAvatar && 'invisible')}>
        {!isOwn && (
          <div className="relative">
            <Avatar className="w-8 h-8 ring-2 ring-border/50 transition-all duration-200 group-hover:ring-primary/30">
              <AvatarImage src={sender?.profilePicture} />
              <AvatarFallback className="text-xs">
                {getInitials(sender?.username)}
              </AvatarFallback>
            </Avatar>
            {/* Online status indicator */}
            {sender?.status === 'online' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
            )}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
        {/* Sender name and timestamp */}
        {showAvatar && !isOwn && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {sender?.username}
            </span>
            {sender?.lastSeen && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(sender.lastSeen), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'relative rounded-2xl px-2 py-2 max-w-full break-words shadow-sm transition-all duration-200 hover:shadow-md',
            isOwn
              ? 'bg-primary text-primary-foreground shadow-blue-sm' // Solid color for better readability
              : 'bg-muted text-foreground border border-border shadow-sm',
            'transform hover:scale-[1.02] focus-within:scale-[1.02]'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>

          {/* Edited indicator */}
          {message.edited && (
            <span
              className={cn(
                'text-xs opacity-70 ml-2',
                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              (edited)
            </span>
          )}
        </div>

        {/* Timestamp and status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-xs text-muted-foreground',
            isOwn && 'flex-row-reverse'
          )}
        >
          <span>
            {message.timestamp &&
            !isNaN(new Date(message.timestamp as any).getTime())
              ? formatDistanceToNow(new Date(message.timestamp as any), {
                  addSuffix: true,
                })
              : '...'}{' '}
          </span>
          {getMessageStatus()}
        </div>
      </div>
    </div>
  );
};
