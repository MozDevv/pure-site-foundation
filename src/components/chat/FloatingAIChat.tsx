import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { apiService, endpoints } from '@/lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  'What courses are available?',
  'How do I submit an assignment?',
  'How do I find a mentor?',
  'Where is the Code Playground?',
  'How do I join a team project?',
  'How do I view my grades?',
  'What is the Innovation Hub?',
  'How do I schedule a meeting?',
  'How does mentorship work?',
  'Where can I track my progress?',
  'How do I change my password?',
  'How do I contact support?',
];

/**
 * Floating AI chat widget — anchored to the bottom-right corner.
 * Dismissible, collapsible, and provides contextual AI help.
 */
export function FloatingAIChat() {
  const isLoggedIn = !!localStorage.getItem('token');
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => 
    sessionStorage.getItem('ai_chat_dismissed') === 'true'
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your TechAI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Try to call the backend AI chat endpoint
      const res = await apiService.post(endpoints.aiChat, { message: text.trim() });
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data?.response || res.data?.message || 'I\'m here to help! Could you rephrase your question?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Fallback response when AI endpoint is unavailable
      const fallback: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getContextualFallback(text.trim()),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsOpen(false);
    sessionStorage.setItem('ai_chat_dismissed', 'true');
  };

  const handleUndismiss = () => {
    setIsDismissed(false);
    sessionStorage.removeItem('ai_chat_dismissed');
  };

  // Show a small re-open button when dismissed
  if (isDismissed) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={handleUndismiss}
        className="fixed bottom-6 right-6 z-[9999] h-10 w-10 rounded-full bg-muted text-muted-foreground shadow-md flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
        title="Reopen AI Chat"
      >
        <MessageCircle className="h-4 w-4" />
      </motion.button>
    );
  }

  return (
    <>
      {/* Floating action button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow ring-4 ring-primary/20 animate-pulse hover:animate-none"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-6 right-6 z-[9999] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden transition-all duration-300',
              isMaximized
                ? 'w-[min(800px,calc(100vw-3rem))] h-[calc(100vh-6rem)]'
                : 'w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">TechAI Assistant</h3>
                  <p className="text-xs opacity-80">Ask me anything</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMaximized(prev => !prev)}
                  className="p-1.5 rounded-md hover:bg-primary-foreground/20 transition-colors"
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-primary-foreground/20 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-md hover:bg-primary-foreground/20 transition-colors"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-secondary" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Quick replies — only for logged-in users at the start */}
              {isLoggedIn && messages.length <= 1 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-xs text-muted-foreground font-medium">Quick questions:</p>
                  {QUICK_REPLIES.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-border">
              <form
                onSubmit={e => { e.preventDefault(); sendMessage(input); }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-sm h-9"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="h-9 w-9" disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Contextual fallback responses when AI endpoint is unavailable */
function getContextualFallback(question: string): string {
  const q = question.toLowerCase();

  // Platform overview
  if (q.includes('what is techai') || q.includes('about techai') || q.includes('what features') || q.includes('what can i do'))
    return 'TechAI Path is a comprehensive learning platform where you can:\n\n• Enroll in tech courses and learn at your own pace\n• Get mentored by industry professionals\n• Join study groups and collaborate with peers\n• Complete assignments and quizzes\n• Work on hands-on projects in the Innovation Hub\n• Practice coding in the Code Playground\n• Earn certificates and badges\n• Track your progress with analytics\n\nYou can explore all features from the sidebar menu.';

  // Courses
  if (q.includes('course') && (q.includes('find') || q.includes('browse') || q.includes('enroll') || q.includes('where')))
    return 'You can find courses by clicking "Courses" in the sidebar. Browse available courses, view details including topics covered, and enroll instantly. Each course has modules you work through at your own pace, with support from mentors and peers.';

  if (q.includes('course') && (q.includes('what') || q.includes('about') || q.includes('topic') || q.includes('content')))
    return 'Courses on TechAI cover topics like Web Development, Mobile Development, Data Science, Machine Learning, Cloud Computing, Cybersecurity, DevOps, UI/UX Design, and more. Each course includes structured modules, hands-on assignments, quizzes, and real-world projects. You can see the full syllabus before enrolling.';

  // Assignments
  if (q.includes('assignment') || q.includes('submit') || q.includes('homework'))
    return 'To submit an assignment:\n1. Go to Assessments → Assignments from the sidebar\n2. Find your assignment and click on it\n3. Click "Submit" and upload your files or type your response\n4. Your submission will be graded by your tutor\n\nYou can also check your grades under Assessments → Grades & Performance.';

  // Quizzes
  if (q.includes('quiz') || q.includes('test') || q.includes('exam'))
    return 'Quizzes are available under Assessments → Quizzes. Each quiz may have a time limit and can include multiple-choice, short answer, or coding questions. Your results are shown immediately after submission, and tutors can provide feedback.';

  // Teams & Innovation Hub
  if (q.includes('team') || q.includes('project') || q.includes('innovation'))
    return 'The Innovation Hub is where you collaborate on real projects:\n\n• Teams: Browse existing teams or create a new one\n• Projects: Submit and track project work with your team\n• Kanban Board: Organize tasks visually\n• Code Playground: Write and run code in 40+ languages\n\nGo to Innovation Hub in the sidebar to get started.';

  // Mentorship
  if (q.includes('mentor'))
    return 'Mentorship on TechAI:\n\n• Find a Mentor: Browse available mentors by expertise under Mentorship → Find Mentor\n• My Mentor: View your assigned mentor and schedule sessions\n• Request a session: Use the Timetable to book time with your mentor\n• Mentors provide guidance, review your work, and help you grow\n\nThis platform encourages learning at your own pace with mentor support.';

  // Chat
  if (q.includes('chat') || q.includes('message') || q.includes('group'))
    return 'The Chat feature lets you:\n\n• Direct Messages: Message any user on the platform\n• Group Chats: Create or join public/private groups\n• Share files, links, and discuss topics\n• You can create private groups where only invited members can join\n\nAccess Chat from the sidebar.';

  // Timetable & Calendar
  if (q.includes('timetable') || q.includes('calendar') || q.includes('schedule') || q.includes('meeting'))
    return 'Your Timetable shows all scheduled events:\n\n• View events in month, week, day, or agenda view\n• Click on any time slot to create a new event\n• RSVP to events (Accept, Maybe, Decline)\n• Set reminders (5 min to 1 week before)\n• Save events to Google Calendar, Outlook, or download .ics files for Apple Calendar\n• Connect your Google Calendar for sync\n\nAccess it from the sidebar under Timetable.';

  // Grades & Performance
  if (q.includes('grade') || q.includes('score') || q.includes('performance') || q.includes('progress'))
    return 'Track your performance under Assessments → Grades & Performance. You\'ll see:\n\n• Individual assignment and quiz scores\n• Overall course progress percentage\n• Module completion status\n• Feedback from tutors\n\nAim to complete all modules and assignments to earn your certificate!';

  // Certificates
  if (q.includes('certificate') || q.includes('badge') || q.includes('achievement'))
    return 'When you complete a course and meet all requirements, you\'ll earn a digital certificate. Certificates include QR verification and can be shared on your profile. You also earn badges for achievements like completing your first assignment, reaching milestones, and more.';

  // Code Playground
  if (q.includes('code') || q.includes('playground') || q.includes('programming') || q.includes('run code'))
    return 'The Code Playground lets you write and execute code in 40+ programming languages including Python, JavaScript, Java, C++, Go, Rust, and more.\n\n• Multi-file support: Create multiple files and they\'ll be merged for execution\n• Templates: Quick-start with language-specific templates\n• Real-time output in the console\n\nFind it under Innovation Hub → Code Playground.';

  // Settings & Profile
  if (q.includes('setting') || q.includes('profile') || q.includes('preference'))
    return 'Access your Settings from the top-right profile menu:\n\n• Profile: Update your name, phone number, and location\n• Notifications: Control email and in-app notifications\n• Appearance: Switch between light, dark, or system theme\n• Calendar: Set default meeting duration and reminders\n• Privacy: Control your online status and profile visibility';

  // Password
  if (q.includes('password') || q.includes('forgot') || q.includes('reset') || q.includes('login'))
    return 'To change your password:\n1. Go to Settings → Profile → Change Password\n2. Enter your current password and set a new one\n\nForgot your password? On the login page, click "Forgot Password" and enter your email. You\'ll receive an OTP (one-time code) to reset it.';

  // Learning pace
  if (q.includes('pace') || q.includes('own pace') || q.includes('self-paced') || q.includes('flexible'))
    return 'TechAI is designed for self-paced learning! You can:\n\n• Start any course when you\'re ready\n• Complete modules at your own speed\n• Revisit content as many times as you need\n• Get support from mentors and peers along the way\n• Set weekly study goals in Settings → Learning\n\nThere\'s no pressure — learn at a pace that works for you.';

  // Announcements
  if (q.includes('announcement') || q.includes('news') || q.includes('update'))
    return 'Platform announcements appear on your dashboard and in the notification bell. Tutors and admins post important updates, deadline reminders, and news here. You can control announcement notifications in Settings → Notifications.';

  // Support / Help
  if (q.includes('support') || q.includes('help') || q.includes('issue') || q.includes('bug') || q.includes('ticket'))
    return 'Need help?\n\n• Use this AI assistant for quick answers\n• Visit the Support page from the sidebar for detailed help\n• If something isn\'t working, report it as a ticket and our team will reach out\n• Contact your mentor or tutor for course-specific questions\n\nWe\'re here to help you succeed!';

  // Registration / Roles
  if (q.includes('register') || q.includes('sign up') || q.includes('role') || q.includes('student') || q.includes('tutor'))
    return 'TechAI has three main roles:\n\n• Student: Instant access after email verification. Learn courses, submit work, join teams.\n• Mentor: Apply and get approved by admin. Guide students, review work, schedule sessions.\n• Tutor: Apply and get approved by admin. Create courses, manage content, grade assignments.\n\nRegister on the Apply page and select your role.';

  // Phone number
  if (q.includes('phone') || q.includes('number') || q.includes('contact'))
    return 'You can update your phone number in Settings → Profile. The phone input supports international formats — select your country (Kenya +254 is the default) and enter your local number. You can also paste a full international number and it will auto-detect the country.';

  return 'I\'m here to help you navigate TechAI Path! You can ask me about:\n\n• Courses, assignments, and quizzes\n• Mentorship and study groups\n• Code Playground and projects\n• Calendar and meetings\n• Settings and profile\n• Certificates and badges\n• Or anything else about the platform!\n\nFor questions I can\'t answer, I\'ll create a ticket and someone will reach out to you.';
}
