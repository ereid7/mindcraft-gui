import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Button, TextInput, ToggleSwitch } from 'flowbite-react';
import Terminal from './Terminal';
import { useAppState } from '../context/AppStateContext';
import modelOptionsData from '../modelOptions.json';
import { useTerminal } from '../context/TerminalContext';

interface LauncherProps {
  // Add any props if needed
}

const Launcher: React.FC<LauncherProps> = () => {
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isLocal, setIsLocal] = useState(true);
  const [port, setPort] = useState('');
  const { apiKeyAvailability } = useAppState();
  const [disabledAgents, setDisabledAgents] = useState<Record<string, boolean>>({});
  const { addOutput, } = useTerminal();

  useEffect(() => {
    loadAgents();
    // Remove loadApiKeys() call as it's no longer needed here
  }, []);

  useEffect(() => {
    if (agents.length > 0) {
      updateDisabledAgents(agents);
    }
  }, [apiKeyAvailability, agents]);

  const loadAgents = async () => {
    try {
      const loadedAgents = await window.electron.ipcRenderer.loadAgents();
      setAgents(loadedAgents);
      updateDisabledAgents(loadedAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
      addOutput(`Error loading agents: ${error}\n`);
    }
  };

  const updateDisabledAgents = async (agentList: string[]) => {
    const disabledStatus: Record<string, boolean> = {};
    for (const agent of agentList) {
      disabledStatus[agent] = await isAgentDisabled(agent);
    }
    console.log('disabledStatus', disabledStatus);
    setDisabledAgents(disabledStatus);
  };

  const isAgentDisabled = async (agent: string): Promise<boolean> => {
    const agentConfig = await window.electron.ipcRenderer.loadAgentConfig(agent);
    const modelOption = modelOptionsData.find(option => option.value === agentConfig.model);
    return !!(modelOption && modelOption.key && !apiKeyAvailability[modelOption.key]);
  };

  const handleAgentSelect = (selectedOptions: any) => {
    setSelectedAgents(selectedOptions.map((option: any) => option.value));
  };

  const handleLaunch = async () => {
    addOutput('Launching agents...\n');
    const profiles = selectedAgents.map(agent => `./profiles/${agent}`);
    const command = `node main.js --profiles ${profiles.join(' ')}`;
    try {
      await window.electron.ipcRenderer.launchAgents(command);
    } catch (error) {
      console.error('Error launching agents:', error);
      addOutput(`Error launching agents: ${error}\n`);
    }
  };

  useEffect(() => {
    loadAgents();

    // Set up listener for agent output
    const removeListener = window.electron.ipcRenderer.on('agent-output', (output: unknown) => {
      console.log("EVAN TEST")
      console.log(output)
      if (typeof output === 'string') {
        addOutput(output);
      }
    });

    // Clean up listener on component unmount
    return () => {
      removeListener();
    };
  }, [addOutput]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Launch Agents</h1>
      
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Select Agents
        </label>
        <Select
          isMulti
          options={agents.map(agent => ({ 
            value: agent, 
            label: agent,
            isDisabled: disabledAgents[agent]
          }))}
          onChange={handleAgentSelect}
          className="basic-multi-select"
          classNamePrefix="select"
        />
      </div>

      <div className="flex items-center mb-6">
        <span className="mr-3">Server</span>
        <ToggleSwitch
          checked={isLocal}
          onChange={setIsLocal}
        />
        <span className="ml-3">Local</span>
      </div>

      {isLocal && (
        <div className="mb-6">
          <label htmlFor="port" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Port
          </label>
          <TextInput
            id="port"
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="Enter port number"
          />
        </div>
      )}

      <Button onClick={handleLaunch} disabled={selectedAgents.length === 0}>
        Launch Agents
      </Button>

      <div className="mt-6">
        <Terminal />
      </div>
    </div>
  );
};

export default Launcher;
