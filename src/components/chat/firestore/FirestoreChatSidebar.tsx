import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Users, MessageCircle, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreateGroupDialog } from './CreateGroupDialog';
import { UserListDialog } from './UserListDialog';
import { useActiveRoomStore } from '@/services/store';

import { ChatRoom, useFirestoreChat } from '../FirestoreChatContext';
export function getInitials(name?: string): string {
  if (!name || typeof name !== 'string') return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '';
  // Take first letter of first two words, fallback to first letter if only one word
  const first = parts[0][0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
}
export const FirestoreChatSidebar: React.FC = () => {
  const {
    rooms,
    users,
    currentUser,
    activeRoom,
    setActiveRoom,
    create1on1Chat,
  } = useFirestoreChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const aTime =
        a.lastMessage?.timestamp?.getTime() || a.createdAt.getTime();
      const bTime =
        b.lastMessage?.timestamp?.getTime() || b.createdAt.getTime();
      return bTime - aTime;
    });
  }, [rooms]);

  // Filter sorted rooms
  const filteredRooms = useMemo(() => {
    return sortedRooms.filter((room) => {
      const roomName = getRoomName(room);
      return roomName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [sortedRooms, searchQuery, currentUser?.id, users]);

  // Set the most recent room as active by default
  useEffect(() => {
    if (sortedRooms.length > 0 && !activeRoom) {
      setActiveRoom(sortedRooms[0]);
    }
  }, [sortedRooms, activeRoom, setActiveRoom]);

  console.log('all Users:', users);

  const otherUsers = users.filter((user) => user.id !== currentUser?.id);

  function getRoomName(room: ChatRoom): string {
    if (room.type === 'group') {
      return room.name || 'Group Chat';
    }

    const otherUserId = room.members.find(
      (id) => id !== `postgres-${currentUser?.id}`
    );
    const normalizedId =
      otherUserId?.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      )?.[0] ?? otherUserId;

    const otherUser = users.find((user) => user.id === normalizedId);
    return otherUser?.username || 'Unknown User';
  }

  function getLastMessagePreview(room: ChatRoom): string {
    if (!room.lastMessage) return 'No messages yet';

    console.log('Last Message:', room.lastMessage);
    const senderName =
      room.lastMessage.senderId === currentUser?.id
        ? 'You'
        : users.find((u) => u.id === room.lastMessage?.senderId)?.username ||
          'Unknown';

    return `${senderName}: ${room.lastMessage.text}`;
  }

  function getStatusColor(status: string) {
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
  }

  function formatTimestamp(date: Date): string {
    const now = new Date();
    const diffInHours = (now.getTime() - date?.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}d`;
    }
  }
  useEffect(() => {
    console.log('Active Room: side', activeRoom);
    console.log('Rooms:', rooms);
    console.log('Users:', users);
  }, [activeRoom, rooms, users]);

  const { activeRoom2, setActiveRoom2 } = useActiveRoomStore();

  return (
    <>
      <div className="w-80 border-r border-border bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateGroup(true)}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUserList(true)}
                className="h-8 w-8 p-0"
              >
                <Users className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No conversations found</p>
                <p className="text-xs mt-1">Start a new chat to get going!</p>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const roomName = getRoomName(room);
                const lastMessagePreview = getLastMessagePreview(room);
                const isActive = activeRoom?.id === room.id;

                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      console.log('Switching to room:', room);
                      setActiveRoom2(room);
                      setActiveRoom(room);
                    }}
                    className={cn(
                      'w-full p-3 rounded-xl text-left transition-all duration-200 mb-1 group hover:shadow-sm border',
                      ' border-transparent hover:border-border/50',
                      isActive &&
                        'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/30 shadow-sm'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {room.type === 'group' ? (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-border/20 transition-all duration-200 group-hover:ring-primary/30">
                            <Hash className="w-5 h-5 text-primary" />
                          </div>
                        ) : (
                          <>
                            {(() => {
                              const otherUserId = room.members.find(
                                (id) => id !== `postgres-${currentUser?.id}`
                              );
                              // Extract full GUID if present, else use as-is
                              const normalizedId =
                                otherUserId?.match(
                                  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
                                )?.[0] ?? otherUserId;

                              const otherUser = users.find(
                                (user) => user.id === normalizedId
                              );
                              const isPinned = false; // TODO: Add pinned functionality

                              return (
                                <>
                                  <Avatar className="w-10 h-10 ring-2 ring-border/20 transition-all duration-200 group-hover:ring-primary/30">
                                    <AvatarImage
                                      src={otherUser?.profilePicture}
                                    />
                                    <AvatarFallback className="text-sm font-medium">
                                      {getInitials(otherUser?.username)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={cn(
                                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                                      getStatusColor(
                                        otherUser?.isOnline
                                          ? 'online'
                                          : 'offline'
                                      ),
                                      otherUser?.isOnline && 'animate-pulse'
                                    )}
                                  />
                                </>
                              );
                            })()}
                          </>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground truncate">
                              {roomName}
                            </span>
                            {false && ( // TODO: Add pinned functionality
                              <span className="text-xs">📌</span>
                            )}
                          </div>
                          {room.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(room.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate pr-2">
                            {lastMessagePreview}
                          </p>
                          <div className="flex flex-col items-end gap-1">
                            {room.unreadCount > 0 && (
                              <div className="relative">
                                {/* Floating blue dot with pulse animation */}
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div>

                                {/* Unread count badge */}
                                <Badge
                                  variant="default"
                                  className="h-4 min-w-4 text-xs px-1 bg-blue-500 text-white ml-1 animate-pulse"
                                >
                                  {room.unreadCount > 99
                                    ? '99+'
                                    : room.unreadCount}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Current User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="text-xs">
                  {currentUser?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                  getStatusColor(currentUser?.status)
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentUser?.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        users={otherUsers}
      />

      <UserListDialog
        open={showUserList}
        onOpenChange={setShowUserList}
        users={otherUsers}
        onSelectUser={(user) => {
          create1on1Chat(user.id);
          setShowUserList(false);
        }}
      />
    </>
  );
};
