import React, { useState, useEffect } from 'react';
import AgentSidebar from './AgentSidebar';
import AgentConfig from './AgentConfig';
import { HiArrowSmRight, HiChartPie, HiInbox, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";

const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const loadedAgents = await window.electron.ipcRenderer.loadAgents();
      setAgents(loadedAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const createAgent = async (name: string) => {
    try {
      await window.electron.ipcRenderer.createAgent(name);
      await loadAgents();
    } catch (error) {
      console.error('Error creating new agent:', error);
    }
  };

  return (
    <div className="flex h-full bg-gray-100">
      <div className="w-64 flex-shrink-0">
        <AgentSidebar
          agents={agents}
          onSelectAgent={setSelectedAgent}
          onCreateAgent={createAgent}
          selectedAgent={selectedAgent}
        />
      </div>
      <main className="flex-1 overflow-y-auto p-8">
        {selectedAgent ? (
          <AgentConfig agentName={selectedAgent} />
        ) : (
          <div className="text-center text-gray-500 mt-20">
            Select an agent or create a new one to view configuration
          </div>
        )}
      </main>
      
    </div>
  );
};

export default AgentManager;
