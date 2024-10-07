import React, { useState } from 'react';
import { Sidebar, TextInput, Button } from 'flowbite-react';
import { HiUser, HiPlus } from 'react-icons/hi';

interface AgentSidebarProps {
  agents: string[];
  selectedAgent: string | null;
  onSelectAgent: (agent: string) => void;
  onCreateAgent: (name: string) => void;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ agents, selectedAgent, onSelectAgent, onCreateAgent }) => {
  const [newAgentName, setNewAgentName] = useState('');

  const handleCreateAgent = () => {
    if (newAgentName) {
      onCreateAgent(newAgentName);
      setNewAgentName('');
    }
  };

  return (
    <Sidebar aria-label="Agent Sidebar">
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <div className="p-4">
            <TextInput
              type="text"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              placeholder="New Agent Name"
              className="mb-2"
            />
            <Button onClick={handleCreateAgent} className="w-full">
              <HiPlus className="mr-2 h-5 w-5" />
              Create Agent
            </Button>
          </div>
          {agents.map((agent) => (
            <Sidebar.Item
              key={agent}
              href="#"
              icon={HiUser}
              onClick={() => onSelectAgent(agent)}
              active={selectedAgent === agent}
            >
              {agent}
            </Sidebar.Item>
          ))}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default AgentSidebar;
