import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AgentSidebar } from '@/components/dashboard/AgentSidebar';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { AgentSelector } from '@/components/dashboard/AgentSelector';
import { SidebarProvider } from '@/components/ui/sidebar';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'natural' | 'agent'>('natural');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AgentSidebar 
          onAgentSelect={(agentId) => {
            setSelectedAgent(agentId);
            setChatMode('agent');
          }}
          onChatSelect={() => {
            setSelectedAgent(null);
            setChatMode('natural');
          }}
        />
        
        <main className="flex-1 flex flex-col">
          {chatMode === 'agent' && selectedAgent ? (
            <AgentSelector 
              agentId={selectedAgent}
              onBack={() => {
                setSelectedAgent(null);
                setChatMode('natural');
              }}
            />
          ) : (
            <ChatInterface />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;