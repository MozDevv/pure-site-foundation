import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFirestoreChat } from '../FirestoreChatContext';

import { RichTextToolbar } from './RichTextToolbar';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentPreview, AttachmentFile } from './AttachmentPreview';
import { useActiveRoomStore } from '@/services/store';

interface FirestoreMessageInputProps {
  roomId: string;
}

export const FirestoreMessageInput: React.FC<FirestoreMessageInputProps> = ({
  roomId,
}) => {


  const { sendMessage, startTyping, stopTyping } = useFirestoreChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
    const { activeRoom2: activeRoom, setActiveRoom2 } = useActiveRoomStore();
  



  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      startTyping(roomId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(roomId);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, startTyping, stopTyping, roomId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    console.log("Component Room ID:", roomId);
    console.log('Sending message:', trimmedMessage);
    console.log('Room ID:', roomId);

    sendMessage(roomId, trimmedMessage);
    setMessage('');

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      stopTyping(roomId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      const newAttachment: AttachmentFile = {
        id: Date.now().toString() + Math.random().toString(36),
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
        uploadProgress: 0,
      };

      setAttachments((prev) => [...prev, newAttachment]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setAttachments((prev) =>
          prev.map((attachment) =>
            attachment.id === newAttachment.id
              ? {
                  ...attachment,
                  uploadProgress: Math.min(
                    (attachment.uploadProgress || 0) + 10,
                    100
                  ),
                }
              : attachment
          )
        );
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setAttachments((prev) =>
          prev.map((attachment) =>
            attachment.id === newAttachment.id
              ? { ...attachment, uploadProgress: 100 }
              : attachment
          )
        );
      }, 1000);
    });

    // Clear the input
    event.target.value = '';
  };

  const handleRemoveAttachment = (fileId: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleFormatToggle = (
    format: 'bold' | 'italic' | 'underline' | 'link'
  ) => {
    setActiveFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  return (
    <div className="space-y-3">
      {/* Attachment previews */}
      <AttachmentPreview
        files={attachments}
        onRemove={handleRemoveAttachment}
      />

      {/* Rich text toolbar
      <RichTextToolbar
        isVisible={isFocused}
        onFormatToggle={handleFormatToggle}
        activeFormats={activeFormats}
      /> */}

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-card border border-border rounded-xl shadow-sm transition-all duration-200 focus-within:shadow-md focus-within:border-primary/50">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 100)}
            placeholder={`Message...`}
            className="min-h-[44px] max-h-32 resize-none pr-20 py-3 border-0 bg-transparent focus:ring-0 placeholder:text-muted-foreground/60"
            rows={1}
          />

          {/* Action buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAttachFile}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="relative">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleEmojiClick}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
              >
                <Smile className="w-4 h-4" />
              </Button>

              <EmojiPicker
                isVisible={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() && attachments.length === 0}
              className="h-8 w-8 p-0 ml-1 bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Helper text */}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </form>
    </div>
  );
};
