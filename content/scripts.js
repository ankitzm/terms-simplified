// Terms Simplified Content Script
console.log('Terms Simplified: Content script loaded on', window.location.hostname);

// Simple content script that just identifies the domain
// The main functionality happens in the popup and background script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Log the current domain for debugging
  const domain = window.location.hostname;
  console.log('Terms Simplified: Ready to analyze T&C for', domain);
  
  // Optional: You could inject a small indicator that the extension is active
  // but for now we'll keep it minimal to avoid conflicts with websites
}

// Listen for messages from the extension (if needed in the future)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDomainInfo') {
    sendResponse({
      domain: window.location.hostname,
      url: window.location.href,
      title: document.title
    });
  }
});
