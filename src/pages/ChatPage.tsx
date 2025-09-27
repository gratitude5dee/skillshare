import React from 'react';
import { ChatInterface } from '@/components/dashboard/ChatInterface';

export const ChatPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-lg text-muted-foreground">
          Chat with our AI assistant for any task or question using natural language
        </p>
      </div>
      
      <div className="h-[calc(100vh-250px)] border border-border rounded-lg overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;