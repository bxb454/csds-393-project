import { ThemeUpdater } from "./theme/theme/Theme.js";
import { LLMTheming } from "./theme/llm-theming.js";

//create a listener for messages from the extension background or popup scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "applyRandomTheme") {

    //apply a "fallback" random theme
    const randomTheme = LLMTheming.getFallbackRandomTheme();
    ThemeUpdater.applyTheme(randomTheme);
    sendResponse({ status: "Random theme applied" });
  } else if (message.action === "applyPlaylistTheme") {
    //apply a theme based on the current playlist
    LLMTheming.generateRandomTheme().then((theme) => {
      ThemeUpdater.applyTheme(theme);
      sendResponse({ status: "Playlist theme applied" });
    });
    return true; 
  } else if (message.action === "resetTheme") {

    //reset the theme back to how it was
    ThemeUpdater.resetToDefault();
    sendResponse({ status: "Theme reset" });
  }
});