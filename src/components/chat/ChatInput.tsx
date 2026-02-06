import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Smile, Code, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useChat } from './ChatContext';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  placeholder?: string;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = 'Type a message...',
  className,
}) => {
  const { activeChannel, sendMessage, startTyping, stopTyping } = useChat();
  const [message, setMessage] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const commands = [
    { name: '/explain', description: 'Explain code or concept', icon: Code },
    { name: '/assign', description: 'Assign task to team member', icon: Zap },
    { name: '/deploy', description: 'Deploy project', icon: Zap },
    { name: '/review', description: 'Request code review', icon: Code },
    { name: '/ai', description: 'Ask SmartDev AI', icon: Zap },
  ];

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activeChannel) {
      sendMessage(message.trim(), activeChannel.id);
      setMessage('');
      setShowCommands(false);
      stopTyping();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.startsWith('/')) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }

    if (value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertCommand = (command: string) => {
    setMessage(command + ' ');
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  return (
    <div
      className={cn('relative border-t border-border bg-background', className)}
    >
      {/* Command suggestions */}
      {showCommands && (
        <div className="absolute bottom-full left-0 right-0 bg-background border border-border rounded-t-lg shadow-lg max-h-48 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Available Commands
            </div>
            {commands
              .filter((cmd) =>
                cmd.name.toLowerCase().includes(message.toLowerCase())
              )
              .map((command) => (
                <button
                  key={command.name}
                  onClick={() => insertCommand(command.name)}
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-secondary transition-colors text-left"
                >
                  <command.icon className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-mono text-sm text-primary">
                      {command.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[36px] max-h-[120px] resize-none pr-20 py-2 font-mono text-sm"
              disabled={!activeChannel}
            />

            {/* Input actions */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Smile className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Code className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Send button */}
          <Button
            type="submit"
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
            disabled={!message.trim() || !activeChannel}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Helper text */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              Type{' '}
              <Badge variant="outline" className="h-4 px-1 font-mono">
                /
              </Badge>{' '}
              for commands
            </span>
            <span>
              <Badge variant="outline" className="h-4 px-1 font-mono">
                Enter
              </Badge>{' '}
              to send,{' '}
              <Badge variant="outline" className="h-4 px-1 font-mono">
                Shift+Enter
              </Badge>{' '}
              for new line
            </span>
          </div>
          <div className="text-right">
            {activeChannel ? (
              <span>#{activeChannel.name}</span>
            ) : (
              <span className="text-destructive">No channel selected</span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
