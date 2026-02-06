import React, { useState } from 'react';
import {
  ChevronDown,
  Hash,
  Volume2,
  Settings,
  Plus,
  Users,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { cn } from '@/lib/utils';
import { useChat } from './ChatContext';

interface ChatSidebarProps {
  className?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ className }) => {
  const {
    activeWorkspace,
    activeChannel,
    setActiveChannel,
    workspaces,
    setActiveWorkspace,
  } = useChat();

  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeWorkspace) {
    return (
      <div
        className={cn(
          'w-60 bg-card border-r border-border flex items-center justify-center',
          className
        )}
      >
        <div className="text-center p-4">
          <p className="text-muted-foreground text-sm">No workspace selected</p>
        </div>
      </div>
    );
  }

  const filteredChannels = activeWorkspace.channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return Volume2;
      case 'dm':
        return Users;
      default:
        return Hash;
    }
  };

  return (
    <div
      className={cn(
        'w-60 bg-card border-r border-border flex flex-col',
        className
      )}
    >
      {/* Workspace Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={activeWorkspace.avatar} />
            <AvatarFallback className="text-xs">
              {activeWorkspace.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {activeWorkspace.name}
            </h3>
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  activeWorkspace.connected ? 'bg-success' : 'bg-destructive'
                )}
              />
              <span className="text-xs text-muted-foreground">
                {activeWorkspace.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Workspace Switcher */}
      {workspaces.length > 1 && (
        <div className="p-3 border-b border-border">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            WORKSPACES
          </div>
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setActiveWorkspace(workspace)}
                className={cn(
                  'w-full flex items-center gap-2 p-2 rounded text-left text-xs transition-colors',
                  workspace.id === activeWorkspace.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-secondary/50'
                )}
              >
                <Avatar className="w-5 h-5">
                  <AvatarImage src={workspace.avatar} />
                  <AvatarFallback className="text-xs">
                    {workspace.platform === 'discord' ? 'D' : 'S'}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate">{workspace.name}</span>
                {!workspace.connected && (
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Channels */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <Collapsible open={isChannelsOpen} onOpenChange={setIsChannelsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start h-6 p-0 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={cn(
                    'w-3 h-3 mr-1 transition-transform',
                    !isChannelsOpen && '-rotate-90'
                  )}
                />
                CHANNELS
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add new channel logic
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1 mt-2">
              {filteredChannels.map((channel) => {
                const ChannelIcon = getChannelIcon(channel.type);
                const isActive = activeChannel?.id === channel.id;

                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={cn(
                      'w-full flex items-center gap-2 p-1.5 rounded text-left transition-colors group',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <ChannelIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">
                      {channel.name}
                    </span>
                    {channel.unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-4 min-w-4 text-xs px-1"
                      >
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* User status */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="w-6 h-6">
              <AvatarImage src="/api/placeholder/24/24" />
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background bg-success" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium">You</div>
            <div className="text-xs text-muted-foreground">Online</div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
