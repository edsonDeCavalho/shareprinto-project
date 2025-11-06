
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

export type Message = {
  id: string;
  text?: string;
  imageUrl?: string;
  sender: 'creator' | 'farmer';
  timestamp: string;
};

type ChatProps = {
  messages: Message[];
  onSendMessage: (data: {text?: string, imageUrl?: string}) => void;
  creatorName: string;
  farmerName: string;
  currentUser: 'creator' | 'farmer';
};

export function Chat({ messages, onSendMessage, creatorName, farmerName, currentUser }: ChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // @ts-ignore
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage({ text: newMessage });
      setNewMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSendMessage({ imageUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
     // Reset file input to allow selecting the same file again
    if(e.target) e.target.value = '';
  }

  return (
    <Card className="flex flex-col h-[60vh] w-full">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => {
             const isCurrentUser = message.sender === currentUser;
             const name = message.sender === 'farmer' ? farmerName : creatorName;
             const avatarInitial = name.charAt(0);

            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start')}
              >
                 {!isCurrentUser && (
                     <Avatar className="h-8 w-8 self-end">
                        <AvatarFallback>{avatarInitial}</AvatarFallback>
                     </Avatar>
                 )}
                <div className={cn(
                    "max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2",
                    isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                )}>
                  {message.imageUrl && (
                    <Image src={message.imageUrl} alt="Chat image" width={300} height={200} className="rounded-md object-cover w-full mb-2" />
                  )}
                  {message.text && <p className="text-sm">{message.text}</p>}
                  <p className={cn("text-xs mt-1", isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {name} &bull; {message.timestamp}
                  </p>
                </div>
                 {isCurrentUser && (
                     <Avatar className="h-8 w-8 self-end">
                         <AvatarFallback>{avatarInitial}</AvatarFallback>
                     </Avatar>
                 )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
