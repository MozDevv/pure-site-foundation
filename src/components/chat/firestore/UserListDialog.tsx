import React, { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatUser } from '@/contexts/FirestoreChatContext';
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

  console.log('users in UserListDialog:', users);

  const filteredUsers =
    users &&
    users?.filter((user) =>
      user?.username?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    );

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

  const handleClose = () => {
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Chat</DialogTitle>
        </DialogHeader>

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
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                filteredUsers?.map((user) => (
                  <button
                    key={user?.id}
                    onClick={() => onSelectUser(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback className="text-sm">
                          {user?.username?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                          getStatusColor(user?.status)
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.username}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.status}
                        {user?.status === 'offline' &&
                          user?.lastSeen &&
                          ` • Last seen ${new Date(
                            user?.lastSeen
                          ).toLocaleDateString()}`}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
