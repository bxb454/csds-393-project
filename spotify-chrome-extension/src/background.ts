console.log("[Background] Service worker loaded");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log("[Background] Received message:", request);
  
  if (request.action === "themeGenerated") {
    console.log("[Background] Theme generated, broadcasting to all tabs");
    
    // Broadcast theme to all tabs
    chrome.tabs.query({}, (tabs) => {
      console.log(`[Background] Found ${tabs.length} tabs`);
      
      tabs.forEach((tab) => {
        console.log(`[Background] Sending to tab ${tab.id}:`, tab.url);
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: "applyTheme",
            theme: request.theme
          }).then(() => {
            console.log(`[Background] Successfully sent to tab ${tab.id}`);
          }).catch((error) => {
            console.log(`[Background] Failed to send to tab ${tab.id}:`, error);
          });
        }
      });
    });
    sendResponse({ status: "Theme broadcast to all tabs" });
  }
  return true;
});

// When extension loads, apply saved theme to all tabs
chrome.runtime.onStartup.addListener(() => {
  console.log("[Background] Extension started");
  chrome.storage.local.get(['currentTheme'], (result) => {
    if (result.currentTheme) {
      console.log("[Background] Found saved theme, applying to all tabs");
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              action: "applyTheme",
              theme: result.currentTheme
            }).catch(() => {});
          }
        });
      });
    }
  });
});

console.log("[Background] Service worker setup complete");