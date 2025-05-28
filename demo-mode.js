// Demo Mode for Terms Simplified Extension
// This file can be used to test the extension UI without a real API key

// Demo data for different domains
const DEMO_RESPONSES = {
    'google.com': {
        domain: 'google.com',
        tcUrl: 'https://policies.google.com/terms',
        flaws: [
            'Google may collect extensive personal data including location, search history, and device information',
            'Terms allow Google to modify or discontinue services with limited notice',
            'Dispute resolution requires binding arbitration, limiting legal options',
            'Broad license granted to Google for user-generated content',
            'Automatic renewal clauses for paid services may be difficult to cancel'
        ]
    },
    'facebook.com': {
        domain: 'facebook.com',
        tcUrl: 'https://www.facebook.com/terms.php',
        flaws: [
            'Extensive data sharing with third-party partners and advertisers',
            'Broad content license allowing Facebook to use your posts and images',
            'Limited liability protection for Facebook in case of data breaches',
            'Automated decision-making may affect content visibility without appeal',
            'Terms changes are communicated through platform notifications only'
        ]
    },
    'netflix.com': {
        domain: 'netflix.com',
        tcUrl: 'https://help.netflix.com/legal/termsofuse',
        flaws: [
            'Automatic subscription renewal with limited cancellation windows',
            'Content availability may change without notice or compensation',
            'Geographic restrictions may limit access while traveling',
            'Price changes communicated with minimal advance notice',
            'Limited refund policy for partial month usage'
        ]
    },
    'default': {
        domain: 'example.com',
        tcUrl: 'https://example.com/terms',
        flaws: [
            'Terms may contain unclear language regarding data usage',
            'Service modifications possible with limited user notification',
            'Dispute resolution may favor the company over users',
            'Cancellation policies might have hidden restrictions'
        ]
    }
};

// Function to enable demo mode
function enableDemoMode() {
    // Override the background script's API call function
    if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
        const originalSendMessage = chrome.runtime.sendMessage;
        
        chrome.runtime.sendMessage = function(message, callback) {
            if (message.action === 'analyzeTC') {
                // Simulate API delay
                setTimeout(() => {
                    const domain = message.domain;
                    const demoData = DEMO_RESPONSES[domain] || DEMO_RESPONSES['default'];
                    
                    // Customize the response for the specific domain
                    if (domain !== demoData.domain) {
                        demoData.domain = domain;
                        demoData.tcUrl = `https://${domain}/terms`;
                    }
                    
                    callback({
                        success: true,
                        data: demoData
                    });
                }, 3000); // 3 second delay to simulate API call
                
                return true;
            } else {
                // Use original function for other messages
                return originalSendMessage.apply(this, arguments);
            }
        };
        
        console.log('Demo mode enabled for Terms Simplified');
    }
}

// Auto-enable demo mode if no API key is detected
chrome.storage.sync.get(['perplexityApiKey'], (result) => {
    if (!result.perplexityApiKey) {
        console.log('No API key found, enabling demo mode');
        enableDemoMode();
    }
});

// Export for manual enabling
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { enableDemoMode, DEMO_RESPONSES };
} 