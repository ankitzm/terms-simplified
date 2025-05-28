# Quick Setup Guide for Terms Simplified Extension

## Environment Configuration (For Developers)

### Option 1: Set Default API Key in Code
1. Open `env.js` file
2. Uncomment line 30 and add your API key:
   ```javascript
   this.config.PERPLEXITY_API_KEY = 'pplx-your-api-key-here';
   ```
3. This will set a default API key for development

### Option 2: Use Environment Variables (if supported by your build system)
1. Copy `.env` file contents to create your own `.env` file
2. Replace `your_perplexity_api_key_here` with your actual API key
3. The extension will automatically use this if no user key is set

## Immediate Testing Steps

### 1. Load the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/chrome` folder from this project
5. The "Terms Simplified" extension should now appear in your extensions list

### 2. Configure API Key (if not set in environment)
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
5. Review the structured analysis results with expandable sections

## New Features in This Version

### Enhanced Analysis Format
- **Structured Results**: Each issue is categorized with risk levels
- **Expandable Sections**: Click on any issue to see detailed breakdown
- **Risk Indicators**: Color-coded badges (🔴 High, 🟡 Medium, 🟢 Low)
- **Detailed Information**: Exact phrases, explanations, and potential impacts

### Improved UI
- **Larger Popup**: Now 400x600px for better readability
- **Better Typography**: Improved fonts and spacing
- **Smooth Animations**: Expandable sections with smooth transitions
- **Better Error Handling**: Dedicated error screens with clear messages

## Demo Websites to Test
- **Google**: Comprehensive terms with data collection issues
- **Facebook**: Complex privacy and content licensing terms
- **Netflix**: Subscription and content availability terms
- **GitHub**: Developer-friendly but detailed terms
- **Discord**: Gaming platform with community guidelines

## Expected Behavior

### Success Flow:
1. Click "Analyze T&C" 
2. Loading screen with animated skeletons and progress updates
3. Structured results page showing categorized issues
4. Click any issue to expand and see detailed analysis
5. Only one section can be expanded at a time
6. "← Back to Home" button returns to main screen

### Analysis Structure:
Each identified issue includes:
- **Issue Category**: Clear title of the problem
- **Risk Level**: High/Medium/Low with color coding
- **Exact Phrase**: Direct quote from the T&C document
- **Issue Explanation**: Why this clause is problematic
- **Potential Impact**: Consequences for users

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
- Check if environment key is set correctly in `env.js`

### UI Issues
- Refresh the extension after making changes
- Check browser console for JavaScript errors
- Ensure popup dimensions are 400x600px
- Clear browser cache if styles don't update

### Analysis Issues
- If analysis seems incomplete, it may be due to API response parsing
- Check browser console for parsing errors
- Try different websites to test consistency

## Development Testing
```bash
# Build the extension
npm run build

# For development with hot reload
npm run dev

# For production testing
npm run start
```

## Environment Variables
- **PERPLEXITY_API_KEY**: Your Perplexity API key
- **DEMO_MODE**: Set to 'true' to enable demo mode by default
- **DEBUG_MODE**: Set to 'true' to enable debug logging

## Extension Permissions Explained
- **activeTab**: Get current website URL and domain
- **scripting**: Inject minimal content scripts for domain detection
- **storage**: Save API key securely in browser sync storage
- **host_permissions**: Access any website to analyze their terms

The extension is designed to be lightweight and privacy-focused. All API processing happens locally or via direct API calls. No user data is collected or stored by the extension itself. 