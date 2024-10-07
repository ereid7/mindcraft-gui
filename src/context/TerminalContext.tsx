import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TerminalContextType {
  output: string[];
  addOutput: (newOutput: string) => void;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [output, setOutput] = useState<string[]>([]);

  const addOutput = (newOutput: string) => {
    setOutput((prevOutput) => [...prevOutput, newOutput]);
  };

  return (
    <TerminalContext.Provider value={{ output, addOutput }}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (context === undefined) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};
