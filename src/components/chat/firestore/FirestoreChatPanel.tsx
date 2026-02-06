import React, { useEffect, useRef, useState } from 'react';
import { Search, Settings, Pin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { useFirestoreChat } from '@/contexts/FirestoreChatContext';
import { FirestoreMessageBubble } from './FirestoreMessageBubble';
import { FirestoreMessageInput } from './FirestoreMessageInput';
import { TypingIndicator } from './TypingIndicator';
import { TopBarNotificationBadge } from './TopBarNotificationBadge';
import { ChatSettingsPanel } from './ChatSettingsPanel';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useActiveRoomStore, useMessagesStore } from '@/services/store';
import { useFirestoreChat } from '../FirestoreChatContext';
import { API_BASE_URL } from '@/lib/api';
import { IconButton } from '@mui/material';
import { Call } from '@mui/icons-material';
import { useCallSignaling } from '@/hooks/CallSignalingService';
import { showIncomingCallToast } from '@/hooks/showIncomingCallToast';

export const FirestoreChatPanel: React.FC = () => {
  const {
    rooms,
    users,
    currentUser,
    setActiveRoom,
    create1on1Chat,
    markAsRead,
    messages,
    isTyping,
  } = useFirestoreChat();
  const { activeRoom2: activeRoom, setActiveRoom2 } = useActiveRoomStore();

  // TODO: Replace this with the correct way to get currentUser in your app

  console.log('Current User🟢🟢:', currentUser);
  console.log('Active Room: 🟢🟢', activeRoom);
  console.log('Messages:', messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const roomMessages = activeRoom ? messages[activeRoom?.id] || [] : [];

  const [availableUsers, setAvailableUsers] = useState([]);

  // Fetch users from your Spring API
  const { data: postgresUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/users/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    },
  });

  // Initiate chat with PostgreSQL user
  const startChat = async (postgresUserId: string) => {
    // Convert PostgreSQL user ID to Firebase-compatible format if needed
    const firebaseUserId = `postgres-${postgresUserId}`;
    await create1on1Chat(firebaseUserId);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  // Mark messages as read when viewing them
  useEffect(() => {
    if (activeRoom && Array.isArray(roomMessages) && roomMessages.length > 0) {
      const unreadMessages = roomMessages
        .filter((msg) => !msg.readBy.includes(currentUser?.id))
        .map((msg) => msg?.id);

      if (unreadMessages.length > 0) {
        markAsRead(activeRoom?.id, unreadMessages);
      }
    }
  }, [activeRoom, roomMessages, currentUser?.id, markAsRead]);

  function getRoomName(): string {
    if (!activeRoom) return '';

    if (activeRoom.type === 'group') {
      return activeRoom.name || 'Group Chat';
    }

    const otherUserId = activeRoom.members.find(
      (id) => id !== `postgres-${currentUser?.id}`
    );
    const normalizedId =
      otherUserId?.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      )?.[0] ?? otherUserId;

    console.log('Normalized ID✅✅:', normalizedId);

    const otherUser = users.find((user) => user.id === normalizedId);
    return otherUser?.username || 'Unknown User';
  }

  function getRoomMembers(): string {
    if (!activeRoom) return '';

    if (activeRoom.type === 'group') {
      const memberNames = activeRoom.members
        .map(
          (id) => users.find((user) => user?.id === `postgres-${id}`)?.username
        )
        .filter(Boolean);
      return `${memberNames.length} members`;
    }

    const otherUserId = activeRoom.members.find(
      (id) => id !== `${currentUser?.id}`
    );
    const otherUser = users.find((user) => user?.id === otherUserId);
    console.log('Other User ID:', otherUserId);
    return otherUser?.isOnline ? 'online' : '';
  }

  // if (!activeRoom) {
  //   return (
  //     <div className="flex-1 flex flex-col bg-background">
  //       <div className="p-4 border-b border-border">
  //         <h3 className="font-medium">Start New Chat</h3>
  //       </div>
  //       <ScrollArea className="flex-1">
  //         {postgresUsers?.data?.map((user) => (
  //           <div
  //             key={user.id}
  //             className="p-3 hover:bg-accent cursor-pointer"
  //             onClick={() => startChat(user.id)}
  //           >
  //             <div className="flex items-center gap-3">
  //               <Avatar>
  //                 <AvatarImage src={user.profilePicture} />
  //                 <AvatarFallback>{user.username[0]}</AvatarFallback>
  //               </Avatar>
  //               <div>
  //                 <p className="font-medium">{user.username}</p>
  //                 <p className="text-sm text-muted-foreground">{user.email}</p>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </ScrollArea>
  //     </div>
  //   );
  // }

  const typingUsers = Array.isArray(isTyping)
    ? isTyping.filter((id) => id !== currentUser?.id)
    : [];

  const { messages2, setMessages2 } = useMessagesStore();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    console.log('here are the messages:', messages2);
    console.log('here are the users:', users);
    console.log('here is the active room:', activeRoom);
    console.log('here are the typing users:', typingUsers);
  }, [activeRoom]);

  const {
    connect,
    setOnIncomingCall,
    setOnCallAccepted,
    acceptCall,
    disconnect,
    initiateCall,
  } = useCallSignaling();
  const [meetingLink, setMeetingLink] = useState<string | null>(null);

  let audio: HTMLAudioElement | null = null;
  useEffect(() => {
    console.log('Setting up call signaling service...');
    if (!currentUser?.id) return;

    const token = localStorage.getItem('token') || '';
    connect(currentUser.id, token);
    setOnIncomingCall((fromUserId) => {
      const user = users.find((u) => u.id === fromUserId);
      showIncomingCallToast({
        fromUser: user?.username || fromUserId,
        onAccept: () => acceptCall(fromUserId, currentUser.id),
        onDecline: () => {
          /* Optionally send a decline signal */
        },
        ringDurationMs: 15000, // 5 seconds
      });
    });

    setOnCallAccepted((meetingLink) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
      }
      setMeetingLink(meetingLink);
    });

    return () => {
      disconnect();
    };
  }, [
    currentUser?.id,
    connect,
    setOnIncomingCall,
    setOnCallAccepted,
    acceptCall,
    disconnect,
  ]);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-x-hidden">
      {/* Header */}
            {meetingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                onClick={() => setMeetingLink(null)}
              >
                Close
              </Button>
            </div>
            <iframe
              src={meetingLink}
              title="Meeting"
              className="flex-1 w-full border-none"
              allow="camera; microphone; fullscreen"
            />
          </div>
        </div>
      )}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {getRoomName()}
              </h2>
              <p className="text-sm tex t-muted-foreground capitalize">
                {getRoomMembers()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              onClick={() => {
                // Find the other user's ID in the current room
                console.log('Active Room when starting call:', activeRoom);
                console.log('Current User when starting call:', currentUser);
                if (!activeRoom || !currentUser?.id) return;
                const otherUserId = activeRoom.members.find((id) => {
                  // Remove 'postgres-' prefix if present
                  const normalizedId = id.startsWith('postgres-')
                    ? id.replace('postgres-', '')
                    : id;
                  return normalizedId !== currentUser.id;
                });
                if (otherUserId) {
                  initiateCall(otherUserId, currentUser.id);
                }
              }}
              title="Start Call"
            >
              <Call
                sx={{
                  color: 'green',
                  fontSize: '24px',
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: 'darkgreen',
                  },
                }}
              />
            </IconButton>

            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Search className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-2 h-[65vh]  overflow-y-auto overflow-x-hidden">
          {messages2?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse"></div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Start the conversation
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Send a message to begin chatting. Your conversations are
                encrypted and secure.
              </p>
            </div>
          ) : (
            messages2?.map((message, index) => {
              const previousMessage =
                index > 0 ? roomMessages[index - 1] : null;
              const showAvatar =
                !previousMessage ||
                previousMessage.senderId !== message.senderId ||
                message.timestamp.getTime() -
                  previousMessage.timestamp.getTime() >
                  300000; // 5 minutes

              return (
                <FirestoreMessageBubble
                  key={message?.id}
                  message={message}
                  showAvatar={showAvatar}
                  isOwn={message?.senderId === currentUser?.id}
                />
              );
            })
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && <TypingIndicator userIds={typingUsers} />}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card/50">
        <FirestoreMessageInput roomId={activeRoom?.id} />
      </div>

      {/* Settings Panel */}
      <ChatSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};
