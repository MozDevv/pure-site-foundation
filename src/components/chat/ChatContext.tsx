import React, { createContext, useContext, useState } from 'react';

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  isBot?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  author: ChatUser;
  timestamp: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
  thread?: ChatMessage[];
  mentions?: string[];
  codeBlock?: boolean;
  attachments?: { type: 'image' | 'file'; url: string; name: string }[];
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'dm';
  unreadCount: number;
  lastMessage?: ChatMessage;
  members: ChatUser[];
}

export interface ChatWorkspace {
  id: string;
  name: string;
  platform: 'discord' | 'slack';
  avatar: string;
  channels: ChatChannel[];
  connected: boolean;
}

interface ChatContextType {
  workspaces: ChatWorkspace[];
  activeWorkspace: ChatWorkspace | null;
  activeChannel: ChatChannel | null;
  messages: ChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  setActiveWorkspace: (workspace: ChatWorkspace) => void;
  setActiveChannel: (channel: ChatChannel) => void;
  sendMessage: (content: string, channelId: string) => void;
  connectPlatform: (platform: 'discord' | 'slack') => void;
  disconnectPlatform: (platform: 'discord' | 'slack') => void;
  addReaction: (messageId: string, emoji: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
}

// Mock data for demonstration
const mockDiscordWorkspace: ChatWorkspace = {
  id: 'discord-1',
  name: 'SmartDev Community',
  platform: 'discord',
  avatar: '/api/placeholder/32/32',
  connected: true,
  channels: [
    {
      id: 'general',
      name: 'general',
      type: 'text',
      unreadCount: 3,
      members: [],
      lastMessage: {
        id: '1',
        content: 'Welcome to SmartDev Discord!',
        author: { id: '1', name: 'DevBot', avatar: '/api/placeholder/24/24', status: 'online', isBot: true },
        timestamp: new Date().toISOString(),
      }
    },
    {
      id: 'development',
      name: 'development',
      type: 'text',
      unreadCount: 0,
      members: []
    },
    {
      id: 'code-review',
      name: 'code-review',
      type: 'text',
      unreadCount: 1,
      members: []
    }
  ]
};

const mockSlackWorkspace: ChatWorkspace = {
  id: 'slack-1',
  name: 'SmartDev Team',
  platform: 'slack',
  avatar: '/api/placeholder/32/32',
  connected: false,
  channels: [
    {
      id: 'random',
      name: 'random',
      type: 'text',
      unreadCount: 0,
      members: []
    },
    {
      id: 'dev-team',
      name: 'dev-team',
      type: 'text',
      unreadCount: 2,
      members: []
    }
  ]
};

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hey team! Just pushed the new authentication system. 🚀',
    author: { id: '1', name: 'John Doe', avatar: '/api/placeholder/32/32', status: 'online' },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    reactions: [{ emoji: '🚀', count: 3, users: ['2', '3', '4'] }]
  },
  {
    id: '2',
    content: 'Great work! I tested it locally and everything looks good.',
    author: { id: '2', name: 'Sarah Chen', avatar: '/api/placeholder/32/32', status: 'online' },
    timestamp: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: '3',
    content: `\`\`\`typescript
// New auth hook usage
const { user, login, logout } = useAuth();

if (!user) {
  return <LoginForm onLogin={login} />;
}
\`\`\`
Great addition to the codebase!`,
    author: { id: '3', name: 'Mike Johnson', avatar: '/api/placeholder/32/32', status: 'away' },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    codeBlock: true
  },
  {
    id: '4',
    content: 'I can help explain that code! The useAuth hook provides authentication state and methods for login/logout functionality. This is a clean pattern for handling auth in React components.',
    author: { id: 'bot', name: 'SmartDev AI', avatar: '/api/placeholder/32/32', status: 'online', isBot: true },
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  }
];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<ChatWorkspace[]>([mockDiscordWorkspace, mockSlackWorkspace]);
  const [activeWorkspace, setActiveWorkspace] = useState<ChatWorkspace | null>(mockDiscordWorkspace);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(mockDiscordWorkspace.channels[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [isConnected, setIsConnected] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (content: string, channelId: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      author: { id: 'current-user', name: 'You', avatar: '/api/placeholder/32/32', status: 'online' },
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response for commands
    if (content.startsWith('/')) {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `I understand you used the command: ${content}. Here's what I can help you with...`,
          author: { id: 'bot', name: 'SmartDev AI', avatar: '/api/placeholder/32/32', status: 'online', isBot: true },
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const connectPlatform = (platform: 'discord' | 'slack') => {
    setWorkspaces(prev => prev.map(ws => 
      ws.platform === platform ? { ...ws, connected: true } : ws
    ));
  };

  const disconnectPlatform = (platform: 'discord' | 'slack') => {
    setWorkspaces(prev => prev.map(ws => 
      ws.platform === platform ? { ...ws, connected: false } : ws
    ));
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          return {
            ...msg,
            reactions: reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, users: [...r.users, 'current-user'] }
                : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [...reactions, { emoji, count: 1, users: ['current-user'] }]
          };
        }
      }
      return msg;
    }));
  };

  const startTyping = () => setIsTyping(true);
  const stopTyping = () => setIsTyping(false);

  return (
    <ChatContext.Provider value={{
      workspaces,
      activeWorkspace,
      activeChannel,
      messages,
      isConnected,
      isTyping,
      setActiveWorkspace,
      setActiveChannel,
      sendMessage,
      connectPlatform,
      disconnectPlatform,
      addReaction,
      startTyping,
      stopTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};