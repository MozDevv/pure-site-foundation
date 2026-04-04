import React, { useEffect, useRef } from 'react';
import { Hash, Users, Settings, Pin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';
import { useChat } from './ChatContext';

interface ChatPanelProps {
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ className }) => {
  const { activeChannel, activeWorkspace, messages, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (activeWorkspace) {
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center bg-background',
          className
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Hash className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Workspace Connected</h3>
          <p className="text-muted-foreground text-sm">
            Connect to Discord or Slack to start chatting with your team.
          </p>
        </div>
      </div>
    );
  }

  if (!activeChannel) {
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center bg-background',
          className
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Hash className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a Channel</h3>
          <p className="text-muted-foreground text-sm">
            Choose a channel from the sidebar to start the conversation.
          </p>
        </div>
      </div>
    );
  }

  const getChannelIcon = () => {
    switch (activeChannel.type) {
      case 'voice':
        return Users;
      case 'dm':
        return Users;
      default:
        return Hash;
    }
  };

  const ChannelIcon = getChannelIcon();

  return (
    <div className={cn('flex-1 flex flex-col bg-background', className)}>
      {/* Channel Header */}
      <div className="h-12 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChannelIcon className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">{activeChannel.name}</h2>
          {activeChannel.type === 'text' && (
            <Badge variant="outline" className="h-5 text-xs">
              {activeWorkspace.platform}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pin className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Users className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Channel Description */}
      {activeChannel.type === 'text' && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Welcome to #{activeChannel.name}. This is the beginning of your
            conversation.
          </p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <ChannelIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-medium mb-1">
                  Welcome to #{activeChannel.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  This is the start of the #{activeChannel.name} channel.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-3 p-3 text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <div className="flex gap-1">
                      <div
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm">Someone is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <ChatInput placeholder={`Message #${activeChannel.name}`} />
    </div>
  );
};
