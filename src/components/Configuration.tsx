import React, { useState, useEffect } from 'react';
import { TextInput, Button, Card } from 'flowbite-react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useAppState } from '../context/AppStateContext';

interface ApiKey {
  name: string;
  value: string;
  hidden: boolean;
}

// TODO also allow user to configure model options

const Configuration: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { name: 'OPENAI_API_KEY', value: '', hidden: true },
    { name: 'OPENAI_ORG_ID', value: '', hidden: true },
    { name: 'GEMINI_API_KEY', value: '', hidden: true },
    { name: 'ANTHROPIC_API_KEY', value: '', hidden: true },
    { name: 'REPLICATE_API_KEY', value: '', hidden: true },
  ]);
  const { updateApiKeyAvailability } = useAppState();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const loadedKeys = await window.electron.ipcRenderer.getApiKeys();
    setApiKeys(apiKeys.map(key => ({
      ...key,
      value: loadedKeys[key.name] || '',
    })));
    updateApiKeyAvailability(loadedKeys);
  };

  const handleInputChange = (index: number, value: string) => {
    const newApiKeys = [...apiKeys];
    newApiKeys[index].value = value;
    setApiKeys(newApiKeys);
  };

  const toggleVisibility = (index: number) => {
    const newApiKeys = [...apiKeys];
    newApiKeys[index].hidden = !newApiKeys[index].hidden;
    setApiKeys(newApiKeys);
  };

  const saveApiKeys = async () => {
    const keysToSave = apiKeys.reduce((acc, key) => {
      acc[key.name] = key.value;
      return acc;
    }, {} as Record<string, string>);
    await window.electron.ipcRenderer.saveApiKeys(keysToSave);
    updateApiKeyAvailability(keysToSave);
    alert('API keys saved successfully!');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Configuration</h1>
      <Card>
        {apiKeys.map((key, index) => (
          <div key={key.name} className="mb-4">
            <label htmlFor={key.name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              {key.name}
            </label>
            <div className="flex">
              <TextInput
                id={key.name}
                type={key.hidden ? 'password' : 'text'}
                value={key.value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="flex-grow"
              />
              <Button
                color="light"
                onClick={() => toggleVisibility(index)}
                className="ml-2"
              >
                {key.hidden ? <HiEye /> : <HiEyeOff />}
              </Button>
            </div>
          </div>
        ))}
        <Button onClick={saveApiKeys}>Save Configuration</Button>
      </Card>
    </div>
  );
};

export default Configuration;