import React, { useMemo, useState } from 'react';
import { Search, Circle } from 'lucide-react';
import {
  SmartDrawer,
  SmartDrawerContent,
  SmartDrawerHeader,
  SmartDrawerTitle,
  SmartDrawerDescription,
} from '@/components/ui/smart-drawer';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatUser } from '@/components/chat/FirestoreChatContext';
import { cn } from '@/lib/utils';

interface UserListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: ChatUser[];
  onSelectUser: (user: ChatUser) => void;
}

export const UserListDialog: React.FC<UserListDialogProps> = ({
  open,
  onOpenChange,
  users,
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort: online users first, then by name
  const sortedAndFilteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    return users
      .filter((user) =>
        user?.username?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      )
      .sort((a, b) => {
        const aOnline = a?.isOnline ? 1 : 0;
        const bOnline = b?.isOnline ? 1 : 0;
        if (bOnline !== aOnline) return bOnline - aOnline;
        return (a?.username || '').localeCompare(b?.username || '');
      });
  }, [users, searchQuery]);

  const onlineCount = useMemo(
    () => (users || []).filter((u) => u?.isOnline).length,
    [users]
  );

  return (
    <SmartDrawer open={open} onOpenChange={onOpenChange}>
      <SmartDrawerContent>
        <SmartDrawerHeader>
          <SmartDrawerTitle>Start New Chat</SmartDrawerTitle>
          <SmartDrawerDescription>
            {onlineCount > 0
              ? `${onlineCount} user${onlineCount > 1 ? 's' : ''} online`
              : 'No users currently online'}
          </SmartDrawerDescription>
        </SmartDrawerHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
              autoFocus
            />
          </div>

          {/* User List */}
          <ScrollArea className="h-72">
            <div className="space-y-1">
              {sortedAndFilteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                sortedAndFilteredUsers.map((user) => (
                  <button
                    key={user?.id}
                    onClick={() => onSelectUser(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback className="text-sm font-medium">
                          {user?.username
                            ?.split(' ')
                            .map((w: string) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                          user?.isOnline
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground'
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SmartDrawerContent>
    </SmartDrawer>
  );
};
