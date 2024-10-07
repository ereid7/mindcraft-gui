// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Update the Channels type
type Channels = 'ipc-example' | 'agent-output' | 'load-agents' | 'create-agent' | 'load-agent-config' | 'save-agent-config' | 'launch-agents' | 'get-api-keys' | 'save-api-keys';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    loadAgents: () => ipcRenderer.invoke('load-agents'),
    createAgent: (name: string) => ipcRenderer.invoke('create-agent', name),
    loadAgentConfig: (name: string) => ipcRenderer.invoke('load-agent-config', name),
    saveAgentConfig: (name: string, config: any) => ipcRenderer.invoke('save-agent-config', name, config),
    launchAgents: (command: string) => ipcRenderer.invoke('launch-agents', command),
    getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
    saveApiKeys: (keys: Record<string, string>) => ipcRenderer.invoke('save-api-keys', keys),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
