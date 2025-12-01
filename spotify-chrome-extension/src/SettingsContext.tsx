// SettingsContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SettingsContextType {
  liveThemes: boolean;
  setLiveThemes: (value: boolean) => void;
  randomThemes: boolean;
  setRandomThemes: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [liveThemesState, setLiveThemesState] = useState(false);
  const [randomThemesState, setRandomThemesState] = useState(false);

  // Load settings from chrome.storage.local on mount
  useEffect(() => {
    try {
      chrome?.storage?.local?.get([STORAGE_KEY], (result) => {
        const stored = result?.[STORAGE_KEY];
        if (stored) {
          setLiveThemesState(Boolean(stored.liveThemes));
          setRandomThemesState(Boolean(stored.randomThemes));
        }
      });
    } catch (e) {
      // chrome may be undefined in test environment - ignore
    }
  }, []);

  // Persist settings whenever they change
  useEffect(() => {
    const payload = { liveThemes: liveThemesState, randomThemes: randomThemesState };
    try {
      chrome?.storage?.local?.set({ [STORAGE_KEY]: payload });
    } catch (e) {
      // ignore in non-extension environments
    }
  }, [liveThemesState, randomThemesState]);

  // Setter wrappers enforce mutual exclusivity: liveThemes xor randomThemes
  function setLiveThemes(value: boolean) {
    setLiveThemesState(value);
    if (value) setRandomThemesState(false);
  }

  function setRandomThemes(value: boolean) {
    setRandomThemesState(value);
    if (value) setLiveThemesState(false);
  }

  return (
    <SettingsContext.Provider
      value={{ liveThemes: liveThemesState, setLiveThemes, randomThemes: randomThemesState, setRandomThemes }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}