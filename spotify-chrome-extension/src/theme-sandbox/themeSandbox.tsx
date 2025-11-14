import { useState } from "react";
import { ThemeUpdater, type TrackMetadata } from "../theme/Theme";
import { LLMTheming } from "../llm-theming";
//import process from "process";

LLMTheming.setApiKey(import.meta.env.GEMINI_API_KEY);

//dummy track for demoing
const demoTrack: TrackMetadata = {
  id: "demo",
  name: "Demo Track",
  artists: ["Demo Artist"],
  genres: ["jazz"],
  albumArt: undefined
};

export function ThemeSandboxApp() {
  const [log, setLog] = useState<string>("");

  async function applyRandom() {
    const theme = await LLMTheming.generateRandomTheme();
    ThemeUpdater.applyTheme(theme);
    setLog("Random theme applied.");
  }

  async function applyFromTrack() {
    const theme = await ThemeUpdater.generateThemeFromTrack(demoTrack);
    ThemeUpdater.applyTheme(theme);
    setLog("Generated theme for demo track.");
  }

  function resetTheme() {
    ThemeUpdater.resetToDefault();
    setLog("Theme reset.");
  }

  return (
    <main style={{ padding: 24, color: "var(--theme-foreground)",
      backgroundColor: "var(--theme-background)",
      border: "var(--theme-accent) solid 2px",
      borderRadius: "8px",
     }}>
      <h1 style = {{color : "var(--theme-primary)"}}>Theme Sandbox</h1>
      <p>use the buttons to use the theme injector without spotify.</p>
      <div style={{ display: "flex", gap: 12, color: "var(--theme-foreground)" }}>
        <button onClick={applyRandom}>Random Theme</button>
        <button onClick={applyFromTrack}>Generate Demo Track Theme</button>
        <button onClick={resetTheme}>Reset</button>
      </div>
      <pre style={{ marginTop: 24 }}>{log}</pre>
    </main>
  );
}