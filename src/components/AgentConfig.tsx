import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Button, Card, TextInput, Textarea, Accordion } from 'flowbite-react';
import { HiPlus, HiX, HiCheck } from 'react-icons/hi';
import modelOptionsData from '../modelOptions.json';

interface AgentConfigProps {
  agentName: string;
}

interface ConversationExample {
  role: string;
  content: string;
}

interface AgentConfig {
  name: string;
  model: string;
  conversing: string;
  coding: string;
  saving_memory: string;
  modes: {
    [key: string]: boolean;
  };
  conversation_examples: ConversationExample[][];
  coding_examples: ConversationExample[][];
}

// TODO better model selection
// TODO add embedding selection

const AgentConfig: React.FC<AgentConfigProps> = ({ agentName }) => {
  const [config, setConfig] = useState<AgentConfig | null>(null);

  useEffect(() => {
    loadAgentConfig();
  }, [agentName]);

  const loadAgentConfig = async () => {
    try {
      const loadedConfig = await window.electron.ipcRenderer.loadAgentConfig(agentName);
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Error loading agent configuration:', error);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(config ? { ...config, [key]: value } : null);
  };

  const handleModesChange = (selectedOptions: any) => {
    if (!config) return;
    const newModes = { ...config.modes };
    Object.keys(newModes).forEach(mode => {
      newModes[mode] = selectedOptions.some((option: any) => option.value === mode);
    });
    setConfig({ ...config, modes: newModes });
  };

  const handleSelectAllModes = () => {
    if (!config) return;
    const newModes = { ...config.modes };
    Object.keys(newModes).forEach(mode => {
      newModes[mode] = true;
    });
    setConfig({ ...config, modes: newModes });
  };

  const saveConfig = async () => {
    if (!config) return;
    try {
      await window.electron.ipcRenderer.saveAgentConfig(agentName, config);
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving agent configuration:', error);
      alert('Failed to save configuration');
    }
  };

  const addExample = (type: 'conversation' | 'coding') => {
    if (!config) return;
    const key = type === 'conversation' ? 'conversation_examples' : 'coding_examples';
    setConfig({
      ...config,
      [key]: [...config[key], []]
    });
  };

  const removeExample = (type: 'conversation' | 'coding', index: number) => {
    if (!config) return;
    const key = type === 'conversation' ? 'conversation_examples' : 'coding_examples';
    const newExamples = [...config[key]];
    newExamples.splice(index, 1);
    setConfig({
      ...config,
      [key]: newExamples
    });
  };

  const updateExample = (type: 'conversation' | 'coding', exampleIndex: number, messageIndex: number, field: 'role' | 'content', value: string) => {
    if (!config) return;
    const key = type === 'conversation' ? 'conversation_examples' : 'coding_examples';
    const newExamples = [...config[key]];
    newExamples[exampleIndex][messageIndex] = {
      ...newExamples[exampleIndex][messageIndex],
      [field]: value
    };
    setConfig({
      ...config,
      [key]: newExamples
    });
  };

  const renderExamples = (type: 'conversation' | 'coding') => {
    const examples = config[`${type}_examples` as keyof AgentConfig];
    return (
      <Accordion.Panel>
        <Accordion.Title>{type.charAt(0).toUpperCase() + type.slice(1)} Examples</Accordion.Title>
        <Accordion.Content>
          {examples.map((example: ConversationExample[], index: number) => (
            <Card key={index} className="mb-2 p-2">
              {example.map((message, messageIndex) => (
                <div key={messageIndex} className="flex mb-2">
                  <Select
                    options={[
                      { value: 'user', label: 'User' },
                      { value: 'assistant', label: 'Assistant' },
                      { value: 'system', label: 'System' }
                    ]}
                    value={{ value: message.role, label: message.role.charAt(0).toUpperCase() + message.role.slice(1) }}
                    onChange={(selected) => updateExample(type, index, messageIndex, 'role', selected?.value || '')}
                    className="w-1/4 mr-2"
                  />
                  <Textarea
                    value={message.content}
                    onChange={(e) => updateExample(type, index, messageIndex, 'content', e.target.value)}
                    className="w-3/4"
                    rows={2}
                  />
                </div>
              ))}
              <div className="flex justify-between mt-2">
                <Button color="success" size="xs" onClick={() => updateExample(type, index, example.length, 'role', 'user')}>
                  <HiPlus className="mr-1 h-4 w-4" />
                  Add Message
                </Button>
                <Button color="failure" size="xs" onClick={() => removeExample(type, index)}>
                  <HiX className="mr-1 h-4 w-4" />
                  Remove Example
                </Button>
              </div>
            </Card>
          ))}
          <Button color="success" size="xs" onClick={() => addExample(type)}>
            <HiPlus className="mr-1 h-4 w-4" />
            Add Example
          </Button>
        </Accordion.Content>
      </Accordion.Panel>
    );
  };

  if (!config) {
    return <div>Loading...</div>;
  }

  const modelOptions = modelOptionsData;

  const modeOptions = Object.keys(config.modes).map(mode => ({
    value: mode,
    label: mode.charAt(0).toUpperCase() + mode.slice(1).replace('_', ' ')
  }));

  const selectedModes = modeOptions.filter(option => config.modes[option.value]);

  return (
    <div className="bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-4">{config.name} Configuration</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <Select
            options={modelOptions}
            value={modelOptions.find(option => option.value === config.model)}
            onChange={(selected) => handleConfigChange('model', selected?.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Conversing</label>
          <Textarea
            value={config.conversing}
            onChange={(e) => handleConfigChange('conversing', e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Coding</label>
          <Textarea
            value={config.coding}
            onChange={(e) => handleConfigChange('coding', e.target.value)}
            className="mt-1"
            rows={4}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Modes</label>
            <Button
              color="light"
              size="xs"
              onClick={handleSelectAllModes}
              title="Select All Modes"
            >
              <HiCheck className="mr-1 h-4 w-4" />
              Select All
            </Button>
          </div>
          <Select
            isMulti
            options={modeOptions}
            value={selectedModes}
            onChange={handleModesChange}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>

        <Accordion>
          {renderExamples('conversation')}
          {renderExamples('coding')}
        </Accordion>

        <Button color="primary" onClick={saveConfig}>
          Save Configuration
        </Button>
      </form>
    </div>
  );
};

export default AgentConfig;
