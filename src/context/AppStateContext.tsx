import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AppStateContextType {
  apiKeyAvailability: Record<string, boolean>;
  updateApiKeyAvailability: (keys: Record<string, string>) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKeyAvailability, setApiKeyAvailability] = useState<Record<string, boolean>>({});
  const updateApiKeyAvailability = (keys: Record<string, string>) => {
    const availability = Object.keys(keys).reduce((acc, key) => {
      acc[key] = !!keys[key];
      return acc;
    }, {} as Record<string, boolean>);
    setApiKeyAvailability(availability);
  };

  useEffect(() => {
    // Load initial API key availability
    window.electron.ipcRenderer.getApiKeys().then(updateApiKeyAvailability);
  }, []);

  return (
    <AppStateContext.Provider value={{ apiKeyAvailability, updateApiKeyAvailability }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
