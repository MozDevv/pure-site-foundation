import { useState, useEffect, useCallback, useRef, createContext } from 'react';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  arrayUnion,
  updateDoc,
  writeBatch,
  arrayRemove,
} from 'firebase/firestore';
import { debounce } from 'lodash-es';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '@/services/api';
import { set } from 'date-fns';
// import { useChatNotifications } from '@/hooks/useChatNotifications';

// Types
export interface ChatUser {
  isOnline: any;
  username: string;
  profilePicture: string;
  avatar: string;
  status: string;
  isCurrent: unknown;
  id: string;
  name: string;
  email: string;
  lastSeen?: Date | string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  readBy: string[];
  edited?: boolean;
}

interface User extends ChatUser {}
interface Message extends ChatMessage {}

export interface ChatRoom {
  id: string;
  type: '1:1' | 'group';
  name?: string;
  members: string[];
  lastMessage?: {
    text: string;
    timestamp: Date;
    senderId: string;
  };
  createdAt: Date;
  unreadCount: number;
}

const firebaseConfig = {
  apiKey: 'AIzaSyAd9QXy7sMeeYMLiq_60FWArAnLEWPGxcI',
  authDomain: 'smartdev-ced65.firebaseapp.com',
  projectId: 'smartdev-ced65',
  storageBucket: 'smartdev-ced65.firebasestorage.app',
  messagingSenderId: '365033746119',
  appId: '1:365033746119:web:a0c53f7d7858c3548058e2',
  measurementId: 'G-M5FGL1K1TK',
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const NOTIFICATION_SOUND = '/notification.wav'; // Place your sound file in public/sounds/
import { toast } from '@/hooks/use-toast';
import { useMessagesStore } from '@/services/store';

export const useFirestoreChat = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [isTyping, setIsTyping] = useState<Record<string, string[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [pendingMessages, setPendingMessages] = useState<Record<string, Set<string>>>({});
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // const { showToastNotification, playNotificationSound } =
  //   useChatNotifications();

  // Initialize auth and get current user

  // Add to your useFirestoreChat hook
  useEffect(() => {
    if (!currentUser?.id) {
      console.log(
        'no User ID found, skipping FirestoreChat initialization',
        currentUser
      );
      return;
    }

    const prefixedUserId = `postgres-${currentUser.id}`;
    const roomsQuery = query(
      collection(db, 'rooms'),
      where('members', 'array-contains', prefixedUserId)
    );

    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const room = change.doc.data() as ChatRoom;
          const lastMessage = room.lastMessage;

          if (
            lastMessage &&
            lastMessage.senderId !== currentUser.id &&
            activeRoom?.id !== room.id
          ) {
            const sender =
              users.find((u) => u.id === lastMessage.senderId)?.username ||
              'Unknown';

            console.log('Here chekit', sender);
            console.log('Here chekit USER', currentUser.id);
            toast({
              title: `${sender} - ${
                room.type === 'group' ? 'Group' : 'Direct'
              }`,
              description: lastMessage.text,
            });
            const audio = new Audio(NOTIFICATION_SOUND);
            audio.play();
            // showToastNotification(sender, lastMessage.text, room.type);
            // playNotificationSound(room.type);
          }
        }
      });
    });

    return unsubscribe;
  }, [currentUser?.id, activeRoom?.id, users]);
  // Prefetch users with caching
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        // Check cache first (5 minute expiry)
        const cached = localStorage.getItem('chat_users_cache');
        const cacheTime = localStorage.getItem('chat_users_cache_time');
        
        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < 5 * 60 * 1000) { // 5 minutes
            setUsers(JSON.parse(cached));
            setIsLoadingUsers(false);
            console.log('✅ Users loaded from cache');
            return;
          }
        }

        // Fetch from API
        const response = await fetch(`${API_BASE_URL}/users/all?pageSize=1000`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        const usersList = data.data || [];
        
        setUsers(usersList);
        
        // Cache for next time
        localStorage.setItem('chat_users_cache', JSON.stringify(usersList));
        localStorage.setItem('chat_users_cache_time', Date.now().toString());
        console.log('✅ Users fetched and cached:', usersList.length);
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        // Use stale cache if available
        const cached = localStorage.getItem('chat_users_cache');
        if (cached) {
          setUsers(JSON.parse(cached));
          console.log('⚠️ Using stale cache due to error');
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded: any = jwtDecode(token);
        const userId = decoded.userId;

        if (!userId) return;

        // Get Firebase token — use prefetched cache if available
        let firebaseToken = sessionStorage.getItem('firebase_token');
        const fbTokenTime = sessionStorage.getItem('firebase_token_time');
        const fbStale = !firebaseToken || !fbTokenTime || (Date.now() - parseInt(fbTokenTime)) > 50 * 60 * 1000;

        if (fbStale) {
          firebaseToken = await fetch(
            `${API_BASE_URL}/users/firebase/token`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ).then((res) => res.text());
          sessionStorage.setItem('firebase_token', firebaseToken);
          sessionStorage.setItem('firebase_token_time', Date.now().toString());
        }

        await signInWithCustomToken(getAuth(app), firebaseToken!);

        const user1 = users?.find((u) => u.id === userId);
        const displayName =
          decoded.username ||
          (user1 ? `${user1.firstName} ${user1.lastName}` : 'Unnamed');
        setCurrentUser({
          id: userId,
          name: displayName,
          username: displayName,
          email: decoded.email || '',
          isOnline: user1?.isOnline ?? false,
          status: user1?.isOnline ? 'online' : 'offline',
          isCurrent: true,
          avatar: user1?.profilePicture || '',
          profilePicture: user1?.profilePicture || '',
          lastSeen: new Date(),
        });
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };

    initializeAuth();
  }, [users]);

  // Fetch user's chat rooms
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log('Fetching rooms for user:', currentUser.id);
    // Always use 'postgres-' prefix for user ID when querying rooms
    const prefixedUserId = `postgres-${currentUser.id}`;
    const q = query(
      collection(db, 'rooms'),
      where('members', 'array-contains', prefixedUserId)
    );

    console.log('Query:', q);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastMessage: data.lastMessage
            ? {
                text: data.lastMessage.text,
                senderId: data.lastMessage.senderId,
                timestamp: data.lastMessage.timestamp?.toDate(), // Convert just the timestamp
              }
            : undefined,
          createdAt: data.createdAt?.toDate(),
        } as ChatRoom;
      });
      setRooms(roomsData);
      setIsInitializing(false);
    });

    console.log('Rooms fetched:', rooms);
    return unsubscribe;
  }, [currentUser?.id]);

  const { messages2, setMessages2 } = useMessagesStore();
  // Listen to messages in active room
  useEffect(() => {
    if (!activeRoom?.id || !currentUser?.id) return;

    const q = query(
      collection(db, 'rooms', activeRoom.id, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data?.timestamp?.toDate(),
          } as Message;
        })
        .reverse();

      console.log('Messages in active room:', messagesData);
      setMessages2(messagesData);
      setMessages((prev) => ({
        ...prev,
        [activeRoom.id]: messagesData,
      }));
      console.log('Updated messages state:', messages);
      console.log('Updated messages2 state:', messages2);
    });

    return unsubscribe;
  }, [activeRoom?.id, currentUser?.id]);

  // Typing indicators
  useEffect(() => {
    if (!activeRoom?.id) return;

    const docRef = doc(db, 'typing', activeRoom.id);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setIsTyping((prev) => ({
        ...prev,
        [activeRoom.id]: doc.data()?.users || [],
      }));
    });

    return unsubscribe;
  }, [activeRoom?.id]);

  const sendMessage = useCallback(
    async (roomId: string, text: string) => {
      if (!text.trim() || !currentUser || !roomId) {
        console.error('Invalid message parameters');
        console.log('Current User:', currentUser);
        console.log('Room ID:', roomId);
        return;
      }

      const messageRef = doc(collection(db, 'rooms', roomId, 'messages'));
      const tempId = messageRef.id;

      try {
        // Track pending message
        setPendingMessages(prev => ({
          ...prev,
          [roomId]: new Set([...(prev[roomId] || []), tempId])
        }));

        // Optimistic UI update
        const optimisticMessage: Message = {
          id: tempId,
          text,
          senderId: currentUser.id,
          timestamp: new Date(),
          readBy: [currentUser.id],
        };

        setMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), optimisticMessage]
        }));

        // Send to Firebase
        const roomRef = doc(db, 'rooms', roomId);
        const batch = writeBatch(db);

        const newMessage = {
          id: tempId,
          text,
          senderId: currentUser.id,
          timestamp: serverTimestamp(),
          readBy: [currentUser.id],
        };

        batch.set(messageRef, newMessage);
        batch.update(roomRef, {
          lastMessage: {
            text,
            timestamp: serverTimestamp(),
            senderId: currentUser.id,
          },
        });

        await batch.commit();
        console.log('✅ Message sent successfully:', tempId);
        
        // Remove from pending
        setPendingMessages(prev => {
          const newPending = { ...prev };
          newPending[roomId]?.delete(tempId);
          return newPending;
        });
      } catch (error) {
        console.error('❌ Error sending message:', error);
        
        // Remove failed message from UI
        setMessages(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).filter(m => m.id !== tempId)
        }));
        
        // Remove from pending
        setPendingMessages(prev => {
          const newPending = { ...prev };
          newPending[roomId]?.delete(tempId);
          return newPending;
        });
        
        toast({
          title: 'Failed to send message',
          description: 'Please check your connection and try again',
          variant: 'destructive',
        });
      }
    },
    [currentUser]
  );

  const createGroupChat = useCallback(
    async (name: string, memberIds: string[]) => {
      if (!currentUser) return null;

      const roomRef = doc(collection(db, 'rooms'));
      const members = [currentUser.id, ...memberIds];

      await setDoc(roomRef, {
        name,
        type: 'group',
        members,
        createdAt: serverTimestamp(),
        unreadCount: 0,
      });

      return {
        id: roomRef.id,
        name,
        type: 'group',
        members,
        createdAt: new Date(),
        unreadCount: 0,
      };
    },
    [currentUser]
  );

  const create1on1Chat = useCallback(
    async (userId: string) => {
      if (!currentUser) return null;

      // Always use 'postgres-' prefix for both users
      const prefixedCurrentUserId = `postgres-${currentUser.id}`;
      const prefixedOtherUserId = userId.startsWith('postgres-')
        ? userId
        : `postgres-${userId}`;
      const sortedIds = [prefixedCurrentUserId, prefixedOtherUserId].sort();
      const roomId = `${sortedIds[0]}:${sortedIds[1]}`;
      const roomRef = doc(db, 'rooms', roomId);

      try {
        await setDoc(
          roomRef,
          {
            type: '1:1',
            members: sortedIds,
            createdAt: serverTimestamp(),
            unreadCount: 0,
          },
          { merge: true }
        );

        return {
          id: roomId,
          type: '1:1',
          members: sortedIds,
          createdAt: new Date(),
          unreadCount: 0,
        };
      } catch (error) {
        console.error('Error creating chat:', error);
        return null;
      }
    },
    [currentUser]
  );

  const markAsRead = useCallback(
    async (roomId: string, messageIds: string[]) => {
      if (!messageIds.length || !currentUser) return;

      const batch = writeBatch(db);
      messageIds.forEach((messageId) => {
        const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
        batch.update(messageRef, {
          readBy: arrayUnion(currentUser.id),
        });
      });

      try {
        await batch.commit();
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },
    [currentUser]
  );

  const startTyping = useCallback(
    debounce(async (roomId: string) => {
      if (!roomId || !currentUser) return;

      const typingRef = doc(db, 'typing', roomId);

      try {
        await setDoc(
          typingRef,
          {
            users: arrayUnion(currentUser.id),
          },
          { merge: true }
        ); // Merge preserves existing data

        typingTimeoutRef.current[roomId] = setTimeout(() => {
          stopTyping(roomId);
        }, 3000);
      } catch (error) {
        console.error('Error updating typing status:', error);
      }
    }, 500),
    [currentUser]
  );

  const stopTyping = useCallback(
    async (roomId: string) => {
      if (!roomId || !currentUser || !typingTimeoutRef.current[roomId]) return;

      clearTimeout(typingTimeoutRef.current[roomId]);
      const typingRef = doc(db, 'typing', roomId);

      try {
        await setDoc(
          typingRef,
          {
            users: arrayRemove(currentUser.id),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error stopping typing:', error);
      }
    },
    [currentUser]
  );

  return {
    currentUser,
    rooms,
    messages: activeRoom?.id ? messages[activeRoom.id] || [] : [],
    activeRoom,
    isTyping: activeRoom?.id ? isTyping[activeRoom.id] || [] : [],
    users,
    isInitializing,
    isLoadingUsers,
    setActiveRoom,
    sendMessage,
    createGroupChat,
    create1on1Chat,
    markAsRead,
    startTyping,
    stopTyping,
  };
};

export const useFirestoreChatContext = () => {
  const context = useFirestoreChat();
  if (!context) {
    throw new Error(
      'useFirestoreChatContext must be used within a FirestoreChatProvider'
    );
  }
  return context;
};

export const FirestoreChatContext = createContext<
  ReturnType<typeof useFirestoreChat> | undefined
>(undefined);

// Provider
export const FirestoreChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const chat = useFirestoreChat();

  return (
    <FirestoreChatContext.Provider value={chat}>
      {children}
    </FirestoreChatContext.Provider>
  );
};
