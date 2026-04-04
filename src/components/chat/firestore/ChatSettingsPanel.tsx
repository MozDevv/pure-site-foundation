import React, { useState } from 'react';
import { X, User, Bell, Shield, Download, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useFirestoreChat } from '../FirestoreChatContext';

interface ChatSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useFirestoreChat();
  const [settings, setSettings] = useState({
    soundEnabled: true,
    toastEnabled: true,
    typingIndicators: true,
    readReceipts: true,
    onlineStatus: true,
    autoBackup: false,
    encryptBackups: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg animate-in slide-in-from-right-5 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-4 space-y-6">
            {/* User Profile */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Profile</h3>
              </div>

              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback className="text-lg">
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div>
                    <Label
                      htmlFor="display-name"
                      className="text-sm text-muted-foreground"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="display-name"
                      defaultValue={currentUser?.name}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notification Preferences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Notifications</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sound notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Play sound for new messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingChange('soundEnabled', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Toast notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Show message previews
                    </p>
                  </div>
                  <Switch
                    checked={settings.toastEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingChange('toastEnabled', checked)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Privacy Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Privacy</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Show typing indicators
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Let others see when you're typing
                    </p>
                  </div>
                  <Switch
                    checked={settings.typingIndicators}
                    onCheckedChange={(checked) =>
                      handleSettingChange('typingIndicators', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Read receipts</p>
                    <p className="text-xs text-muted-foreground">
                      Show when you've read messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.readReceipts}
                    onCheckedChange={(checked) =>
                      handleSettingChange('readReceipts', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Online status</p>
                    <p className="text-xs text-muted-foreground">
                      Show when you're online
                    </p>
                  </div>
                  <Switch
                    checked={settings.onlineStatus}
                    onCheckedChange={(checked) =>
                      handleSettingChange('onlineStatus', checked)
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Chat Backup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Backup</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto backup</p>
                    <p className="text-xs text-muted-foreground">
                      Automatically backup chats daily
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) =>
                      handleSettingChange('autoBackup', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Encrypt backups</p>
                    <p className="text-xs text-muted-foreground">
                      Password protect backup files
                    </p>
                  </div>
                  <Switch
                    checked={settings.encryptBackups}
                    onCheckedChange={(checked) =>
                      handleSettingChange('encryptBackups', checked)
                    }
                  />
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  Export Chat History
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
