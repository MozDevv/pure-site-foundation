import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFirestoreChat } from '../FirestoreChatContext';

export const TopBarNotificationBadge: React.FC = () => {
  const { rooms } = useFirestoreChat();

  const totalUnreadCount = rooms.reduce(
    (total, room) => total + (room.unreadCount || 0),
    0
  );

  if (totalUnreadCount === 0) {
    return (
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 relative">
        <Bell className="w-4 h-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 relative">
      <Bell className="w-4 h-4 text-muted-foreground" />
      <div className="absolute -top-1 -right-1">
        <Badge
          variant="default"
          className="h-5 min-w-5 text-xs px-1.5 bg-blue-500 text-white animate-pulse"
        >
          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
        </Badge>
        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
      </div>
    </Button>
  );
};
