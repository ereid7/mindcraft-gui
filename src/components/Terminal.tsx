import React, { useEffect, useRef } from 'react';
import { useTerminal } from '../context/TerminalContext';

const Terminal: React.FC = () => {
  const { output } = useTerminal();
  const terminalRef = useRef<HTMLDivElement>(null)
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        ref={terminalRef}
        className="bg-black dark:bg-slate-800 text-green-500 font-mono p-4 rounded-b-lg overflow-y-auto h-[300px]"
      >
        {output?.map((line, index) => (
          <div key={index} className="mb-1">
            {line.startsWith('$') ? (
              <>
                <span className="text-blue-400">$</span> {line.slice(1)}
              </>
            ) : (
              line
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;

