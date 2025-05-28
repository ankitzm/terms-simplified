# Terms Simplified 🔍

An AI-powered browser extension that analyzes Terms and Conditions to help you understand potential issues and harmful clauses before accepting them.

## Features ✨

- **One-click Analysis**: Analyze any website's Terms & Conditions with a single button
- **AI-Powered Detection**: Uses Perplexity Sonar AI to identify potentially harmful clauses
- **User-Friendly Interface**: Clean, intuitive popup interface (280x180px)
- **Security-Focused**: Your API key is stored locally and never shared
- **Real-time Feedback**: Beautiful loading animations and progress updates

## What it Analyzes 🔍

The extension specifically looks for:
- Excessive data collection or sharing practices
- Unfair termination clauses
- Unreasonable liability limitations
- Automatic renewal or billing issues
- Intellectual property overreach
- Dispute resolution limitations
- Privacy concerns
- Unclear refund policies

## Setup Instructions 🚀

### 1. Get a Perplexity API Key
1. Visit [Perplexity API Settings](https://www.perplexity.ai/settings/api)
2. Sign up or log in to your account
3. Generate a new API key
4. Copy the API key (starts with `pplx-`)

### 2. Install the Extension
1. Clone this repository or download the source code
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist/chrome` folder

### 3. Configure API Key
1. Right-click the extension icon and select "Options"
2. Paste your Perplexity API key
3. Click "Save Configuration"

## How to Use 📋

1. **Navigate** to any website
2. **Click** the Terms Simplified extension icon
3. **Click** the "Analyze T&C" button
4. **Wait** for the AI analysis (shows progress updates)
5. **Review** the identified issues and potential concerns

## Development 🛠️

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Test the extension
npm run start
```

### Project Structure
```
terms-simplified/
├── popup/                 # Extension popup UI
│   ├── popup.html        # Main popup interface
│   └── popup.js          # Popup functionality
├── options/              # Extension options page
│   ├── options.html      # API key configuration
│   └── options.js        # Options functionality
├── content/              # Content scripts
│   └── scripts.js        # Content script (minimal)
├── background.js         # Service worker with AI logic
├── manifest.json         # Extension manifest
└── README.md            # This file
```

## API Usage & Credits 💰

This extension uses the Perplexity Sonar API which has usage limits:
- **Respectful Usage**: The extension is designed to minimize API calls
- **Smart Caching**: Results could be cached to reduce redundant requests
- **Efficient Queries**: Uses optimized prompts to get maximum value per request

## Privacy & Security 🔒

- **Local Storage**: Your API key is stored locally in your browser
- **No Data Collection**: We don't collect or store any user data
- **Secure Communication**: All API calls are made directly from your browser
- **Open Source**: All code is open and auditable

## Troubleshooting 🔧

### Common Issues:

**"Please set your Perplexity API key"**
- Go to extension options and add your API key

**"No terms and conditions found"**
- Some websites may not have easily discoverable T&C
- Try searching manually on the website

**"API request failed"**
- Check your API key validity
- Ensure you have API credits remaining
- Check your internet connection

**Extension not working**
- Try reloading the extension
- Check browser console for errors
- Ensure you're on a valid website (not chrome:// pages)

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

MIT License - see LICENSE file for details

## Support 💬

If you encounter issues or have questions:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Provide browser console logs if applicable

## Roadmap 🗺️

Future enhancements planned:
- [ ] Result caching to reduce API usage
- [ ] More detailed analysis categories
- [ ] Export analysis results
- [ ] Support for more AI providers
- [ ] Bulk analysis for multiple sites
- [ ] Browser sync for settings

---

**Disclaimer**: This tool provides AI-generated analysis and should not be considered legal advice. Always consult with legal professionals for important agreements.
