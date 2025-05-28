# Quick Setup Guide for Terms Simplified Extension

## Immediate Testing Steps

### 1. Load the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/chrome` folder from this project
5. The "Terms Simplified" extension should now appear in your extensions list

### 2. Configure API Key
1. Right-click the Terms Simplified extension icon
2. Select "Options" from the context menu
3. Enter your Perplexity API key (format: `pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. Click "Save Configuration"
5. Wait for the success message

### 3. Test the Extension
1. Navigate to any website (e.g., `https://google.com`)
2. Click the Terms Simplified extension icon
3. Click the "Analyze T&C" button
4. Watch the loading animation with progress updates
5. Review the analysis results

## Demo Websites to Test
- **Google**: Has comprehensive terms of service
- **GitHub**: Developer-friendly terms
- **Facebook**: Complex privacy policies
- **Netflix**: Subscription-based service terms
- **Discord**: Gaming platform terms

## Expected Behavior

### Success Flow:
1. Click "Analyze T&C" 
2. Loading screen appears with animated skeletons
3. Progress text updates: "Loading T&C..." → "Finding terms..." → "Analyzing..." → "Looking for issues..."
4. Results page shows potential issues found in the terms
5. "Back to Home" button returns to main screen

### Error Handling:
- **No API Key**: Clear error message directing to options
- **No T&C Found**: Informative error about the website
- **API Error**: Network or quota error messages
- **Invalid Domain**: Error for special pages like `chrome://`

## Troubleshooting

### Extension Not Loading
- Check console errors in `chrome://extensions/`
- Ensure all files are in the `dist/chrome` folder
- Try disabling and re-enabling the extension

### API Issues
- Verify your Perplexity API key is valid
- Check you have sufficient API credits
- Test with a simple website first (like Google)

### UI Issues
- Refresh the extension after making changes
- Check browser console for JavaScript errors
- Ensure popup dimensions are 280x180px

## Development Testing
```bash
# Build the extension
npm run build

# For development with hot reload
npm run dev

# For production testing
npm run start
```

## Extension Permissions Explained
- **activeTab**: Get current website URL and domain
- **scripting**: Inject content scripts (minimal usage)
- **storage**: Save API key securely in browser
- **host_permissions**: Access any website to analyze their terms

The extension is designed to be lightweight and privacy-focused. All processing happens locally or via direct API calls. 