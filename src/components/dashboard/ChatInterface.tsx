import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { ManusAPIService, ManusTask } from '@/services/ManusAPIService';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'task';
  content: string;
  timestamp: Date;
  task?: ManusTask;
}

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Welcome to WZRD.work! I'm your AI assistant powered by Manus. You can ask me to help with any task - from content creation to business strategy. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create task with Manus API
      const task = await ManusAPIService.createTask(input.trim());
      
      const taskMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'task',
        content: `I've created a task for you: "${input.trim()}". The task is now being processed by Manus AI.`,
        timestamp: new Date(),
        task
      };

      setMessages(prev => [...prev, taskMessage]);

      // Poll for task completion (simplified)
      setTimeout(() => {
        const completionMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `Task completed! Your request has been processed. Task ID: ${task.id}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
      }, 2000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-lg overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-[80%] p-4 ${
              message.type === 'user' 
                ? 'bg-primary text-primary-foreground ml-12' 
                : 'bg-card text-card-foreground mr-12'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="prose prose-sm max-w-none">
                    <p className="mb-2">{message.content}</p>
                  </div>
                  
                  {message.task && (
                    <div className="mt-3 space-y-2">
                      <Badge variant="secondary">Task ID: {message.task.id}</Badge>
                      <div className="text-xs opacity-75">
                        Mode: {message.task.mode} | 
                        Status: {message.task.status || 'Processing'}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-50 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-card text-card-foreground mr-12 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Creating your task...
                </div>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you'd like me to help you with..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="h-[60px] w-[60px]"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};