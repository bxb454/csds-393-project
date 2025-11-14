// SettingsContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface SettingsContextType {
  liveThemes: boolean;
  setLiveThemes: (value: boolean) => void;
  weatherThemes: boolean;
  setWeatherThemes: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [liveThemes, setLiveThemes] = useState(false);
  const [weatherThemes, setWeatherThemes] = useState(false);

  return (
    <SettingsContext.Provider value={{ liveThemes, setLiveThemes, weatherThemes, setWeatherThemes }}>
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