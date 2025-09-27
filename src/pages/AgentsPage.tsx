import React, { useState } from 'react';
import { AgentGrid } from '@/components/dashboard/AgentGrid';
import { AgentModal } from '@/components/dashboard/AgentModal';

export const AgentsPage: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    setShowAgentModal(true);
  };

  const handleCloseModal = () => {
    setShowAgentModal(false);
    setSelectedAgent(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Agent Library</h1>
        <p className="text-lg text-muted-foreground">
          Choose from our collection of specialized AI agents to accomplish various tasks
        </p>
      </div>
      
      <AgentGrid onAgentSelect={handleAgentSelect} />
      
      <AgentModal
        agentId={selectedAgent}
        isOpen={showAgentModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AgentsPage;