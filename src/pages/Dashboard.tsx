import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AgentGrid } from '@/components/dashboard/AgentGrid';
import { AgentModal } from '@/components/dashboard/AgentModal';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageSquare, LogOut, Grid3X3, Bot } from 'lucide-react';
import manusLogo from '@/assets/manus-logo.png';

export const Dashboard: React.FC = () => {
  const { signOut } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    setShowAgentModal(true);
  };

  const handleCloseModal = () => {
    setShowAgentModal(false);
    setSelectedAgent(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={manusLogo} alt="Manus" className="h-10 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">WZRD.work</h1>
                <p className="text-sm text-muted-foreground">powered by Gemini</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant={showChat ? "default" : "outline"}
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2"
              >
                {showChat ? <Grid3X3 className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                {showChat ? 'View Agents' : 'AI Chat'}
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {showChat ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">AI Assistant</h2>
              <p className="text-muted-foreground">Chat with our AI assistant for any task or question</p>
            </div>
            <div className="h-[600px] border border-border rounded-lg overflow-hidden">
              <ChatInterface />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">AI Agent Library</h2>
              <p className="text-lg text-muted-foreground">Choose from our collection of specialized AI agents</p>
            </div>
            <AgentGrid onAgentSelect={handleAgentSelect} />
          </div>
        )}
      </main>

      {/* Agent Modal */}
      <AgentModal
        agentId={selectedAgent}
        isOpen={showAgentModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Dashboard;