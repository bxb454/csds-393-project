import { ThemeUpdater, type TrackMetadata } from './theme/Theme';
import { LLMTheming } from './llm-theming';

// Initialize API key
LLMTheming.setApiKey(import.meta.env.VITE_GEMINI_API_KEY);

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "applyRandomTheme") {
    handleApplyRandomTheme(sendResponse);
    return true; // Keep channel open for async response
  } 
  else if (request.action === "applyPlaylistTheme") {
    handleApplyPlaylistTheme(request.trackMetadata, sendResponse);
    return true;
  }
  else if (request.action === "resetTheme") {
    ThemeUpdater.resetToDefault();
    sendResponse({ status: "Theme reset successfully!" });
  }
});

async function handleApplyRandomTheme(sendResponse: (response: any) => void) {
  try {
    const theme = await LLMTheming.generateRandomTheme();
    ThemeUpdater.applyTheme(theme);
    
    // Store theme in Chrome storage for persistence
    chrome.storage.local.set({ currentTheme: theme });
    
    sendResponse({ status: "Random theme applied successfully!" });
  } catch (error) {
    sendResponse({ 
      status: `Error: ${error instanceof Error ? error.message : "Failed to generate theme"}` 
    });
  }
}

async function handleApplyPlaylistTheme(
  trackMetadata: TrackMetadata, 
  sendResponse: (response: any) => void
) {
  try {
    const theme = await ThemeUpdater.generateThemeFromTrack(trackMetadata);
    ThemeUpdater.applyTheme(theme);
    
    // Store theme in Chrome storage for persistence
    chrome.storage.local.set({ currentTheme: theme });
    
    sendResponse({ 
      status: `Theme generated for "${trackMetadata.name}"` 
    });
  } catch (error) {
    sendResponse({ 
      status: `Error: ${error instanceof Error ? error.message : "Failed to generate theme"}` 
    });
  }
}

// Apply saved theme on page load (fixes persistence issue)
chrome.storage.local.get(['currentTheme'], (result) => {
  if (result.currentTheme) {
    ThemeUpdater.applyTheme(result.currentTheme);
  }
});