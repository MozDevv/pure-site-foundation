import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bot, MoreHorizontal, Reply, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChatMessage as ChatMessageType, useChat } from './ChatContext';

interface ChatMessageProps {
  message: ChatMessageType;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  className,
}) => {
  const { addReaction } = useChat();
  const [showActions, setShowActions] = useState(false);

  const handleReaction = (emoji: string) => {
    addReaction(message.id, emoji);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'away':
        return 'bg-warning';
      case 'offline':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <div
      className={cn(
        'group relative flex gap-3 p-3 hover:bg-secondary/30 transition-smooth',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.author.avatar} />
          <AvatarFallback className="text-xs">
            {message.author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
            getStatusColor(message.author.status)
          )}
        />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">
            {message.author.name}
          </span>
          {message.author.isBot && (
            <Badge
              variant="secondary"
              className="h-4 px-1 text-xs flex items-center gap-1"
            >
              <Bot className="w-3 h-3" />
              BOT
            </Badge>
          )}
          <span className="text-xs text-muted-foreground font-mono">
            {formatDistanceToNow(new Date(message.timestamp), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Message Text */}
        <div className="text-sm leading-relaxed">
          {message.codeBlock ? (
            <pre className="bg-secondary/50 border border-border rounded-md p-3 overflow-x-auto text-xs font-mono">
              <code>{message.content}</code>
            </pre>
          ) : (
            <p className="text-foreground whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => handleReaction(reaction.emoji)}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/60 hover:bg-secondary transition-colors text-xs"
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Thread indicator */}
        {message.thread && message.thread.length > 0 && (
          <button className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
            <Reply className="w-3 h-3" />
            {message.thread.length} replies
          </button>
        )}
      </div>

      {/* Message Actions */}
      {showActions && (
        <div className="absolute top-1 right-2 flex items-center gap-1 bg-background border border-border rounded-md shadow-md">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => handleReaction('👍')}
          >
            <Smile className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Reply className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
