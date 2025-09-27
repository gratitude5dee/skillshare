import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Video, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasVideo?: boolean;
}

interface DigitalAssistantProps {
  currentAction?: any;
  isExecuting: boolean;
}

export function DigitalAssistant({ currentAction, isExecuting }: DigitalAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Hi! I\'m your automation assistant. I can help you understand workflows, troubleshoot issues, and optimize your automation scripts. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-suggest helpful messages based on current state
  useEffect(() => {
    if (currentAction && isExecuting) {
      const contextMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🔄 I'm now executing "${currentAction.name}". This ${currentAction.action_type} action should take about ${currentAction.estimated_time_seconds} seconds. Would you like me to explain what's happening or generate a video tutorial?`,
        timestamp: new Date(),
        hasVideo: true
      };
      
      setMessages(prev => [...prev, contextMessage]);
    }
  }, [currentAction, isExecuting]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    // Simulate AI response with context awareness
    setTimeout(() => {
      let responseContent = '';
      
      if (inputValue.toLowerCase().includes('explain') || inputValue.toLowerCase().includes('what')) {
        responseContent = currentAction 
          ? `🎯 The current action "${currentAction.name}" is a ${currentAction.action_type} operation. ${currentAction.description || 'It performs the following steps based on your recorded workflow.'} The confidence level is ${Math.round((currentAction.confidence_score || 0) * 100)}%, which means it should execute reliably.`
          : '📚 I can explain any workflow action once you select one to execute. Each action has detailed instructions, confidence scores, and estimated execution times.';
      } else if (inputValue.toLowerCase().includes('video') || inputValue.toLowerCase().includes('tutorial')) {
        responseContent = '🎬 I can generate a step-by-step video tutorial showing exactly how this action works. The video will include visual annotations and explanations of each step. Would you like me to create one now?';
      } else if (inputValue.toLowerCase().includes('problem') || inputValue.toLowerCase().includes('error')) {
        responseContent = '🔍 I can help troubleshoot automation issues. Common problems include changed UI elements, timing issues, or data validation errors. If you describe the specific problem, I can provide targeted solutions.';
      } else if (inputValue.toLowerCase().includes('optimize') || inputValue.toLowerCase().includes('improve')) {
        responseContent = '⚡ Great question! I can suggest optimizations like adjusting checkpoint frequencies, improving action confidence, or identifying redundant steps. Based on your usage patterns, I can recommend workflow improvements.';
      } else {
        responseContent = '🤖 I understand you\'re asking about automation. I can help with workflow explanations, video tutorials, troubleshooting, optimization tips, and real-time guidance during execution. What specific aspect would you like to explore?';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        hasVideo: inputValue.toLowerCase().includes('video')
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[400px] flex flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    {message.type === 'assistant' && (
                      <Bot className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      
                      {message.hasVideo && (
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Video className="h-3 w-3" />
                            Generate Video Tutorial
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        
                        {message.type === 'assistant' && isExecuting && (
                          <Badge variant="secondary" className="text-xs">
                            Context-aware
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex justify-start">
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about workflows, request tutorials, or get help..."
          className="flex-1"
          disabled={isGenerating}
        />
        
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isGenerating}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
        
        <Button variant="outline" size="icon" disabled>
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}