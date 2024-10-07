import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import './App.css';
import AgentManager from '../components/AgentManager';
import Launcher from '../components/Launcher';
import AppNavbar from '../components/AppNavbar';
import { TerminalProvider } from '../context/TerminalContext';
import { AppStateProvider } from '../context/AppStateContext';

import Configuration from '../components/Configuration';

export default function App() {
  return (
    <AppStateProvider>
      <TerminalProvider>
        <Router>
          <div className="flex flex-col h-screen">
            <AppNavbar />
            <div className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<AgentManager />} />
                <Route path="/launcher" element={<Launcher />} />
                <Route path="/configuration" element={<Configuration />} />
              </Routes>
            </div>
          </div>
        </Router>
      </TerminalProvider>
    </AppStateProvider>
  );
}
