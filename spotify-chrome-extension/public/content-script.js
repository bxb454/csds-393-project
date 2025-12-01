console.log("Theme content script loaded");

// Apply theme function
function applyTheme(theme) {
  console.log("Applying theme to page:", theme);
  
  const styleId = "spotify-extension-theme";
  let styleTag = document.getElementById(styleId);
  
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }
  
  const css = `
    :root {
      --theme-primary: rgba(${theme.colors.primary.r}, ${theme.colors.primary.g}, ${theme.colors.primary.b}, ${theme.colors.primary.a});
      --theme-secondary: rgba(${theme.colors.secondary.r}, ${theme.colors.secondary.g}, ${theme.colors.secondary.b}, ${theme.colors.secondary.a});
      --theme-accent: rgba(${theme.colors.accent.r}, ${theme.colors.accent.g}, ${theme.colors.accent.b}, ${theme.colors.accent.a});
      --theme-background: rgba(${theme.colors.background.r}, ${theme.colors.background.g}, ${theme.colors.background.b}, ${theme.colors.background.a});
      --theme-foreground: rgba(${theme.colors.foreground.r}, ${theme.colors.foreground.g}, ${theme.colors.foreground.b}, ${theme.colors.foreground.a});
    }
    
    html, body {
      background: var(--theme-background) !important;
      color: var(--theme-foreground) !important;
    }
    
    a, a:visited {
      color: var(--theme-accent) !important;
    }
    
    button, input[type="button"], input[type="submit"] {
      background-color: var(--theme-primary) !important;
      color: var(--theme-foreground) !important;
    }
    
    button:hover, input[type="button"]:hover, input[type="submit"]:hover {
      background-color: var(--theme-accent) !important;
    }
  `;
  
  styleTag.textContent = css;
}

// Listen for theme updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applyTheme") {
    applyTheme(request.theme);
    sendResponse({ status: "Theme applied" });
  } else if (request.action === "resetTheme") {
    const styleTag = document.getElementById("spotify-extension-theme");
    if (styleTag) {
      styleTag.remove();
    }
    sendResponse({ status: "Theme reset" });
  }
  return true;
});

// On load, check for saved theme
chrome.storage.local.get(['currentTheme'], (result) => {
  if (result.currentTheme) {
    console.log("Applying saved theme on page load");
    applyTheme(result.currentTheme);
  }
});