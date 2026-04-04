import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, endpoints } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  User, Bell, Palette, Shield, Lock, Clock, Globe, Monitor,
  Sun, Moon, Save, Loader2, ChevronRight, Settings2, Calendar,
  BookOpen, GraduationCap, Eye, EyeOff, ToggleLeft, ToggleRight,
  Mail, MessageSquare, Video, Megaphone, Target, Sliders,
  Server, Zap, Users, Database, FileText, CheckCircle2, AlertCircle, Wrench,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';

// ── Animation variants ──
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ── Types ──
interface UserSettingsData {
  id?: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  meetingReminders: boolean;
  assignmentReminders: boolean;
  mentorshipNotifications: boolean;
  chatNotifications: boolean;
  announcementNotifications: boolean;
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  calendarView: string;
  defaultMeetingDuration: number;
  defaultReminderMinutes: number;
  showOnlineStatus: boolean;
  showProfilePublicly: boolean;
  allowMentorRequests: boolean;
  studyReminderEnabled: boolean;
  studyReminderTime: string | null;
  weeklyGoalHours: number;
  defaultGradingScale: string;
  autoAssignMentees: boolean;
  officeHoursEnabled: boolean;
  officeHours: string | null;
}

interface SystemSettingData {
  id?: string;
  settingKey: string;
  settingValue: string;
  settingType: string;
  category: string;
  description: string;
  isPublic: boolean;
}

// ── Tab definition ──
type TabId = 'profile' | 'notifications' | 'appearance' | 'calendar' | 'privacy' | 'learning' | 'teaching' | 'system' | 'security' | 'features';

interface TabDef {
  id: TabId;
  label: string;
  icon: any;
  roles: string[];
  description: string;
}

const TABS: TabDef[] = [
  { id: 'profile', label: 'Profile', icon: User, roles: ['Student', 'Tutor', 'Admin', 'Super_Admin'], description: 'Your personal information' },
  { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['Student', 'Tutor', 'Admin', 'Super_Admin'], description: 'Manage your notification preferences' },
  { id: 'appearance', label: 'Appearance', icon: Palette, roles: ['Student', 'Tutor', 'Admin', 'Super_Admin'], description: 'Theme, language & display settings' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['Student', 'Tutor', 'Admin', 'Super_Admin'], description: 'Calendar & scheduling preferences' },
  { id: 'privacy', label: 'Privacy', icon: Shield, roles: ['Student', 'Tutor', 'Admin', 'Super_Admin'], description: 'Control your visibility & data' },
  { id: 'learning', label: 'Learning', icon: BookOpen, roles: ['Student'], description: 'Study goals & learning preferences' },
  { id: 'teaching', label: 'Teaching', icon: GraduationCap, roles: ['Tutor'], description: 'Grading, office hours & mentoring' },
  { id: 'system', label: 'Platform', icon: Server, roles: ['Admin', 'Super_Admin'], description: 'Platform-wide configuration' },
  { id: 'security', label: 'Security', icon: Lock, roles: ['Admin', 'Super_Admin'], description: 'Security & access policies' },
  { id: 'features', label: 'Features', icon: Zap, roles: ['Admin', 'Super_Admin'], description: 'Enable/disable platform modules' },
];

// ── Notification switch row ──
function NotificationRow({ icon: Icon, label, description, checked, onChange }: {
  icon: any; label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-input font-medium">{label}</p>
          <p className="text-small text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ── Main component ──
export default function SettingsPage() {
  const queryClient = useQueryClient();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const userRole = user?.role || 'Student';
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [localSettings, setLocalSettings] = useState<Partial<UserSettingsData>>({});
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', location: '' });
  const [hasChanges, setHasChanges] = useState(false);

  const visibleTabs = TABS.filter(t => t.roles.includes(userRole));

  // ── Fetch user settings ──
  const { data: userSettings, isLoading: settingsLoading } = useQuery<UserSettingsData>({
    queryKey: ['userSettings'],
    queryFn: () => apiService.get(endpoints.getUserSettings).then(r => r.data),
  });

  // ── Fetch full user profile from API ──
  const { data: profileApiData, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => apiService.get(endpoints.getProfile).then(r => r.data),
  });

  // ── Fetch system settings (admin) ──
  const { data: systemSettings, isLoading: systemLoading } = useQuery<SystemSettingData[]>({
    queryKey: ['systemSettings'],
    queryFn: () => apiService.get(endpoints.getSystemSettings).then(r => r.data),
    enabled: userRole === 'Admin' || userRole === 'Super_Admin',
  });

  // Initialize local state from fetched data
  useEffect(() => {
    if (userSettings) setLocalSettings(userSettings);
  }, [userSettings]);

  // Initialize profile from API response (preferred over localStorage)
  useEffect(() => {
    if (profileApiData) {
      setProfileData({
        firstName: profileApiData.firstName || '',
        lastName: profileApiData.lastName || '',
        email: profileApiData.email || '',
        phoneNumber: profileApiData.phoneNumber || '',
        location: profileApiData.location || '',
      });
    } else if (user) {
      // Fallback to localStorage while API loads
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
      });
    }
  }, [profileApiData]);

  // ── Mutations ──
  const saveUserSettings = useMutation({
    mutationFn: (data: Partial<UserSettingsData>) =>
      apiService.put(endpoints.updateUserSettings, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success('Settings saved successfully');
      setHasChanges(false);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to save settings'),
  });

  const saveProfile = useMutation({
    mutationFn: (data: typeof profileData) =>
      apiService.put(endpoints.updateProfile, data),
    onSuccess: (res) => {
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update profile'),
  });

  const saveSystemSetting = useMutation({
    mutationFn: (data: Partial<SystemSettingData>) =>
      apiService.put(endpoints.upsertSystemSetting, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast.success('System setting updated');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update setting'),
  });

  const initSystemSettings = useMutation({
    mutationFn: () => apiService.post(endpoints.initializeSystemSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast.success('Default settings initialized');
    },
  });

  // ── Helper to update local settings ──
  const updateSetting = (key: keyof UserSettingsData, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => saveUserSettings.mutate(localSettings);

  // ── Helper for system settings ──
  const getSystemValue = (key: string): string => {
    const s = systemSettings?.find(s => s.settingKey === key);
    return s?.settingValue || '';
  };

  const updateSystemSetting = (key: string, value: string, type?: string, category?: string, description?: string) => {
    saveSystemSetting.mutate({ settingKey: key, settingValue: value, settingType: type, category, description });
  };

  // ── Loading skeleton ──
  if (settingsLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // ── Tab content renderers ──
  const renderProfile = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Personal Information</CardTitle>
            <CardDescription className="text-input">Update your name, email, and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <div className="space-y-2 md:col-span-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-input">First Name</Label>
                  <Input autoComplete="given-name" value={profileData.firstName} onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))} className="text-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-input">Last Name</Label>
                  <Input autoComplete="family-name" value={profileData.lastName} onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))} className="text-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-input">Email</Label>
                  <Input autoComplete="email" value={profileData.email} disabled className="text-input bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-input">Phone Number</Label>
                  <PhoneInput value={profileData.phoneNumber} onChange={(val) => setProfileData(p => ({ ...p, phoneNumber: val }))} defaultCountry="KE" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-input">Location</Label>
                  <Input autoComplete="off" value={profileData.location} onChange={e => setProfileData(p => ({ ...p, location: e.target.value }))} className="text-input" placeholder="City, Country" />
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={() => saveProfile.mutate(profileData)} disabled={saveProfile.isPending || profileLoading} className="text-input">
                {saveProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Change Password</CardTitle>
            <CardDescription className="text-input">Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-input">Current Password</Label>
                <Input type="password" placeholder="Enter current password" className="text-input" />
              </div>
              <div />
              <div className="space-y-2">
                <Label className="text-input">New Password</Label>
                <Input type="password" placeholder="Enter new password" className="text-input" />
              </div>
              <div className="space-y-2">
                <Label className="text-input">Confirm Password</Label>
                <Input type="password" placeholder="Confirm new password" className="text-input" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" className="text-input">
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Notification Channels</CardTitle>
            <CardDescription className="text-input">Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <NotificationRow icon={Mail} label="Email Notifications" description="Receive notifications via email" checked={localSettings.emailNotifications ?? true} onChange={v => updateSetting('emailNotifications', v)} />
            <NotificationRow icon={Bell} label="In-App Notifications" description="Show notifications within the platform" checked={localSettings.inAppNotifications ?? true} onChange={v => updateSetting('inAppNotifications', v)} />
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Notification Types</CardTitle>
            <CardDescription className="text-input">Control which notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <NotificationRow icon={Calendar} label="Meeting Reminders" description="Get reminded about upcoming meetings" checked={localSettings.meetingReminders ?? true} onChange={v => updateSetting('meetingReminders', v)} />
            <NotificationRow icon={FileText} label="Assignment Reminders" description="Deadline and grading notifications" checked={localSettings.assignmentReminders ?? true} onChange={v => updateSetting('assignmentReminders', v)} />
            <NotificationRow icon={Users} label="Mentorship Updates" description="Mentor/mentee activity notifications" checked={localSettings.mentorshipNotifications ?? true} onChange={v => updateSetting('mentorshipNotifications', v)} />
            <NotificationRow icon={MessageSquare} label="Chat Messages" description="New message notifications" checked={localSettings.chatNotifications ?? true} onChange={v => updateSetting('chatNotifications', v)} />
            <NotificationRow icon={Megaphone} label="Announcements" description="Platform announcements and updates" checked={localSettings.announcementNotifications ?? true} onChange={v => updateSetting('announcementNotifications', v)} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderAppearance = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Theme</CardTitle>
            <CardDescription className="text-input">Choose your preferred color scheme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun, desc: 'Clean, bright interface' },
                { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                { value: 'system', label: 'System', icon: Monitor, desc: 'Match your OS setting' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateSetting('theme', opt.value)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${localSettings.theme === opt.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}`}
                >
                  {localSettings.theme === opt.value && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <opt.icon className="h-6 w-6 text-primary" />
                  <span className="text-input font-medium">{opt.label}</span>
                  <span className="text-small text-muted-foreground text-center">{opt.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Regional Settings</CardTitle>
            <CardDescription className="text-input">Language, timezone, and date formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-input">Language</Label>
                <Select value={localSettings.language || 'en'} onValueChange={v => updateSetting('language', v)}>
                  <SelectTrigger className="text-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-input">Timezone</Label>
                <Select value={localSettings.timezone || 'Africa/Nairobi'} onValueChange={v => updateSetting('timezone', v)}>
                  <SelectTrigger className="text-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-input">Date Format</Label>
                <Select value={localSettings.dateFormat || 'DD/MM/YYYY'} onValueChange={v => updateSetting('dateFormat', v)}>
                  <SelectTrigger className="text-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-input">Time Format</Label>
                <Select value={localSettings.timeFormat || '24h'} onValueChange={v => updateSetting('timeFormat', v)}>
                  <SelectTrigger className="text-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24-hour (14:00)</SelectItem>
                    <SelectItem value="12h">12-hour (2:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderCalendar = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Calendar Preferences</CardTitle>
            <CardDescription className="text-input">Customize your calendar and scheduling behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-input">Default Calendar View</Label>
                <Select value={localSettings.calendarView || 'month'} onValueChange={v => updateSetting('calendarView', v)}>
                  <SelectTrigger className="text-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="agenda">Agenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-input">Default Meeting Duration</Label>
                <Select value={String(localSettings.defaultMeetingDuration || 60)} onValueChange={v => updateSetting('defaultMeetingDuration', parseInt(v))}>
                  <SelectTrigger className="text-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-input">Default Reminder</Label>
                <Select value={String(localSettings.defaultReminderMinutes || 15)} onValueChange={v => updateSetting('defaultReminderMinutes', parseInt(v))}>
                  <SelectTrigger className="text-input"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="10">10 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderPrivacy = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Privacy & Visibility</CardTitle>
            <CardDescription className="text-input">Control who can see your information</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <NotificationRow icon={Eye} label="Online Status" description="Show when you are online to other users" checked={localSettings.showOnlineStatus ?? true} onChange={v => updateSetting('showOnlineStatus', v)} />
            <NotificationRow icon={Globe} label="Public Profile" description="Allow other users to view your profile" checked={localSettings.showProfilePublicly ?? true} onChange={v => updateSetting('showProfilePublicly', v)} />
            <NotificationRow icon={Users} label="Mentor Requests" description="Allow students to send you mentorship requests" checked={localSettings.allowMentorRequests ?? true} onChange={v => updateSetting('allowMentorRequests', v)} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderLearning = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Study Preferences</CardTitle>
            <CardDescription className="text-input">Set your learning goals and study reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-input font-medium">Daily Study Reminder</p>
                  <p className="text-small text-muted-foreground">Get a daily reminder to study</p>
                </div>
              </div>
              <Switch checked={localSettings.studyReminderEnabled ?? false} onCheckedChange={v => updateSetting('studyReminderEnabled', v)} />
            </div>
            {localSettings.studyReminderEnabled && (
              <div className="ml-12 space-y-2">
                <Label className="text-input">Reminder Time</Label>
                <Input type="time" value={localSettings.studyReminderTime || '09:00'} onChange={e => updateSetting('studyReminderTime', e.target.value)} className="text-input w-40" />
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <Label className="text-input">Weekly Study Goal (hours)</Label>
              <div className="flex items-center gap-4">
                <Input type="number" min={1} max={80} value={localSettings.weeklyGoalHours || 10} onChange={e => updateSetting('weeklyGoalHours', parseInt(e.target.value))} className="text-input w-24" />
                <span className="text-small text-muted-foreground">hours per week</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="bg-primary rounded-full h-2 transition-all duration-500" style={{ width: `${Math.min(100, ((localSettings.weeklyGoalHours || 10) / 40) * 100)}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderTeaching = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Grading & Assessments</CardTitle>
            <CardDescription className="text-input">Configure grading defaults for your courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-input">Default Grading Scale</Label>
              <Select value={localSettings.defaultGradingScale || 'percentage'} onValueChange={v => updateSetting('defaultGradingScale', v)}>
                <SelectTrigger className="text-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                  <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                  <SelectItem value="points">Points-based</SelectItem>
                  <SelectItem value="pass_fail">Pass/Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-h4-sb">Mentorship Settings</CardTitle>
            <CardDescription className="text-input">Configure how you mentor students</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <NotificationRow icon={Users} label="Auto-assign Mentees" description="Automatically accept new mentee requests" checked={localSettings.autoAssignMentees ?? false} onChange={v => updateSetting('autoAssignMentees', v)} />
            <div className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-input font-medium">Office Hours</p>
                    <p className="text-small text-muted-foreground">Set your availability for student meetings</p>
                  </div>
                </div>
                <Switch checked={localSettings.officeHoursEnabled ?? false} onCheckedChange={v => updateSetting('officeHoursEnabled', v)} />
              </div>
              {localSettings.officeHoursEnabled && (
                <div className="ml-12 mt-3 space-y-2">
                  <Label className="text-input">Office Hours Schedule</Label>
                  <Input value={localSettings.officeHours || ''} onChange={e => updateSetting('officeHours', e.target.value)} placeholder="e.g., Mon 9-11, Wed 14-16, Fri 10-12" className="text-input" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderSystem = () => {
    const categories = ['general', 'meetings', 'email'];
    const isMaintenanceOn = getSystemValue('maintenance_mode') === 'true';
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        {/* Auto-approve Students Toggle */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-h4-sb flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Auto-Approval
              </CardTitle>
              <CardDescription className="text-input">
                Automatically approve new student registrations without manual review. Students will be notified when their account is activated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-input font-medium">Enable Auto-Approval</p>
                  <p className="text-small text-muted-foreground">
                    {getSystemValue('auto_approve_students') === 'true'
                      ? 'New student registrations are automatically approved.'
                      : 'New student registrations require manual admin approval.'}
                  </p>
                </div>
                <Switch
                  checked={getSystemValue('auto_approve_students') === 'true'}
                  onCheckedChange={v =>
                    updateSystemSetting('auto_approve_students', String(v), 'boolean', 'system', 'Automatically approve new student registrations')
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Maintenance Mode Toggle — prominent at top */}
        <motion.div variants={itemVariants}>
          <Card className={isMaintenanceOn ? 'border-destructive' : ''}>
            <CardHeader>
              <CardTitle className="text-h4-sb flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Mode
              </CardTitle>
              <CardDescription className="text-input">
                When enabled, all non-admin users will see a maintenance page instead of the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-input font-medium">Enable Maintenance Mode</p>
                  <p className="text-small text-muted-foreground">
                    {isMaintenanceOn ? 'The platform is currently in maintenance mode.' : 'The platform is running normally.'}
                  </p>
                </div>
                <Switch
                  checked={isMaintenanceOn}
                  onCheckedChange={v => updateSystemSetting('maintenance_mode', String(v), 'boolean', 'system', 'Enable/disable maintenance mode for the platform')}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-input font-medium">Maintenance Message</Label>
                <Input
                  placeholder="Custom message to display during maintenance..."
                  defaultValue={getSystemValue('maintenance_message')}
                  onBlur={e => {
                    if (e.target.value) {
                      updateSystemSetting('maintenance_message', e.target.value, 'string', 'system', 'Custom message displayed during maintenance mode');
                    }
                  }}
                  className="text-input"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h4-sb">Platform Configuration</h3>
              <p className="text-input text-muted-foreground">Manage system-wide settings</p>
            </div>
            <Button variant="outline" onClick={() => initSystemSettings.mutate()} disabled={initSystemSettings.isPending} className="text-input">
              {initSystemSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              Initialize Defaults
            </Button>
          </div>
        </motion.div>
        {categories.map(cat => {
          const items = (systemSettings || []).filter(s => s.category === cat);
          if (items.length === 0) return null;
          return (
            <motion.div key={cat} variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-h4-sb capitalize">{cat} Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map(setting => (
                    <div key={setting.settingKey} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-input font-medium">{setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                        <p className="text-small text-muted-foreground">{setting.description}</p>
                      </div>
                      {setting.settingType === 'boolean' ? (
                        <Switch
                          checked={setting.settingValue === 'true'}
                          onCheckedChange={v => updateSystemSetting(setting.settingKey, String(v), 'boolean', setting.category, setting.description)}
                        />
                      ) : (
                        <Input
                          value={setting.settingValue}
                          onChange={e => {/* local state if needed */}}
                          onBlur={e => updateSystemSetting(setting.settingKey, e.target.value, setting.settingType, setting.category, setting.description)}
                          className="text-input w-full sm:w-48"
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const renderSecurity = () => {
    const securitySettings = (systemSettings || []).filter(s => s.category === 'security');
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-h4-sb">Security Policies</CardTitle>
              <CardDescription className="text-input">Configure authentication and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {securitySettings.map(setting => (
                <div key={setting.settingKey} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-input font-medium">{setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                    <p className="text-small text-muted-foreground">{setting.description}</p>
                  </div>
                  {setting.settingType === 'boolean' ? (
                    <Switch
                      checked={setting.settingValue === 'true'}
                      onCheckedChange={v => updateSystemSetting(setting.settingKey, String(v), 'boolean', 'security', setting.description)}
                    />
                  ) : (
                    <Input
                      defaultValue={setting.settingValue}
                      onBlur={e => updateSystemSetting(setting.settingKey, e.target.value, setting.settingType, 'security', setting.description)}
                      className="text-input w-full sm:w-32"
                      type="number"
                    />
                  )}
                </div>
              ))}
              {securitySettings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-input">No security settings configured. Click "Initialize Defaults" on the Platform tab first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  const renderFeatures = () => {
    const featureSettings = (systemSettings || []).filter(s => s.category === 'features');
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-h4-sb">Feature Toggles</CardTitle>
              <CardDescription className="text-input">Enable or disable platform modules for all users</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {featureSettings.map(setting => (
                <div key={setting.settingKey} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-input font-medium">{setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                      <p className="text-small text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={setting.settingValue === 'true'}
                    onCheckedChange={v => updateSystemSetting(setting.settingKey, String(v), 'boolean', 'features', setting.description)}
                  />
                </div>
              ))}
              {featureSettings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-input">No feature settings configured. Click "Initialize Defaults" on the Platform tab first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  const tabRenderers: Record<TabId, () => JSX.Element> = {
    profile: renderProfile,
    notifications: renderNotifications,
    appearance: renderAppearance,
    calendar: renderCalendar,
    privacy: renderPrivacy,
    learning: renderLearning,
    teaching: renderTeaching,
    system: renderSystem,
    security: renderSecurity,
    features: renderFeatures,
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2-sb">Settings</h1>
            <p className="text-input text-muted-foreground mt-1">Manage your account and platform preferences</p>
          </div>
          {hasChanges && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button onClick={handleSave} disabled={saveUserSettings.isPending}>
                {saveUserSettings.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Layout: sidebar tabs + content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab navigation */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="lg:sticky lg:top-20">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {visibleTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-input font-medium truncate">{tab.label}</p>
                      {activeTab === tab.id && (
                        <p className="text-small opacity-80 truncate">{tab.description}</p>
                      )}
                    </div>
                    {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto shrink-0" />}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {tabRenderers[activeTab]?.()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
