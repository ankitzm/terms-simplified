// Demo Mode for Terms Simplified Extension
// This file can be used to test the extension UI without a real API key

// Demo data for different domains with structured analysis format
const DEMO_RESPONSES = {
    'google.com': {
        domain: 'google.com',
        tcUrl: 'https://policies.google.com/terms',
        analysis: [
            {
                title: 'EXCESSIVE DATA COLLECTION',
                riskLevel: 'High',
                exactPhrase: 'We collect information to provide better services to all our users — from figuring out basic stuff like which language you speak, to more complex things like which ads you\'ll find most useful.',
                explanation: 'Google collects extensive personal data including location, search history, device information, and browsing patterns without clear limitations.',
                impact: 'Your personal information may be used for targeted advertising and could be shared with third parties, potentially compromising your privacy.'
            },
            {
                title: 'UNILATERAL SERVICE MODIFICATION',
                riskLevel: 'Medium',
                exactPhrase: 'We may modify these terms or any additional terms that apply to a Service to, for example, reflect changes to the law or changes to our Services.',
                explanation: 'Google reserves the right to modify terms and services with limited notice to users.',
                impact: 'Service features you rely on could be changed or discontinued without adequate notice or user consent.'
            },
            {
                title: 'BROAD CONTENT LICENSE',
                riskLevel: 'High',
                exactPhrase: 'When you upload, submit, store, send or receive content to or through our Services, you give Google a worldwide license to use, host, store, reproduce, modify, create derivative works.',
                explanation: 'Users grant Google extensive rights to use their content for various purposes.',
                impact: 'Your photos, documents, and other content could be used by Google for machine learning, advertising, or other commercial purposes.'
            },
            {
                title: 'DISPUTE RESOLUTION LIMITATIONS',
                riskLevel: 'Medium',
                exactPhrase: 'You and Google agree to resolve any claim, dispute or controversy exclusively through final and binding arbitration.',
                explanation: 'Mandatory arbitration limits users\' ability to seek legal remedies through courts.',
                impact: 'You may be restricted from joining class action lawsuits or pursuing legal action in traditional courts.'
            }
        ]
    },
    'facebook.com': {
        domain: 'facebook.com',
        tcUrl: 'https://www.facebook.com/terms.php',
        analysis: [
            {
                title: 'EXTENSIVE DATA SHARING',
                riskLevel: 'High',
                exactPhrase: 'We share information with third-party partners who help us provide and improve our Products or who use Facebook Business Tools.',
                explanation: 'Facebook shares user data extensively with third-party partners and advertisers.',
                impact: 'Your personal information and activity data may be shared with hundreds of partner companies for advertising and analytics.'
            },
            {
                title: 'CONTENT OWNERSHIP AMBIGUITY',
                riskLevel: 'Medium',
                exactPhrase: 'You grant us a non-exclusive, transferable, sub-licensable, royalty-free, and worldwide license to host, use, distribute, modify, run, copy, publicly perform or display, translate, and create derivative works.',
                explanation: 'Broad license allowing Facebook to use your posts, photos, and other content extensively.',
                impact: 'Your personal photos and posts could be used by Facebook for advertising, machine learning, or other commercial purposes without additional compensation.'
            },
            {
                title: 'ALGORITHMIC CONTENT CONTROL',
                riskLevel: 'Medium',
                exactPhrase: 'We use machine learning and other automated systems to determine which content and information to show you.',
                explanation: 'Automated decision-making affects what content you see without clear appeal processes.',
                impact: 'Important information may be filtered out, and you have limited control over what content reaches you or your followers.'
            }
        ]
    },
    'netflix.com': {
        domain: 'netflix.com',
        tcUrl: 'https://help.netflix.com/legal/termsofuse',
        analysis: [
            {
                title: 'AUTOMATIC SUBSCRIPTION RENEWAL',
                riskLevel: 'High',
                exactPhrase: 'Your Netflix membership will continue month-to-month or year-to-year unless and until you cancel your membership.',
                explanation: 'Automatic subscription renewal with limited cancellation windows and complex cancellation processes.',
                impact: 'Unexpected charges may occur if you forget to cancel, with potential difficulty in obtaining refunds for unused portions.'
            },
            {
                title: 'CONTENT AVAILABILITY CHANGES',
                riskLevel: 'Medium',
                exactPhrase: 'Netflix will use reasonable efforts to continuously provide content, but availability of specific titles may change without notice.',
                explanation: 'Content you want to watch may disappear without notice or compensation.',
                impact: 'Movies and shows you planned to watch may become unavailable, with no refund or alternative compensation provided.'
            },
            {
                title: 'GEOGRAPHIC ACCESS RESTRICTIONS',
                riskLevel: 'Low',
                exactPhrase: 'You may view Netflix content primarily within the country in which you have established your account.',
                explanation: 'Geographic restrictions may limit access while traveling.',
                impact: 'You may not be able to access your paid Netflix content while traveling abroad, even temporarily.'
            }
        ]
    },
    'default': {
        domain: 'example.com',
        tcUrl: 'https://example.com/terms',
        analysis: [
            {
                title: 'UNCLEAR DATA USAGE POLICIES',
                riskLevel: 'Medium',
                exactPhrase: 'We may collect and use information about your use of our services.',
                explanation: 'Vague language regarding how personal data is collected, used, and shared.',
                impact: 'Uncertainty about what personal information is being collected and how it might be used or shared with third parties.'
            },
            {
                title: 'BROAD SERVICE MODIFICATION RIGHTS',
                riskLevel: 'Medium',
                exactPhrase: 'We reserve the right to modify, suspend, or discontinue our services at any time.',
                explanation: 'Company retains extensive rights to change services without user consultation.',
                impact: 'Service features you depend on could be modified or removed without notice or user input.'
            }
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
                    let demoData = DEMO_RESPONSES[domain] || DEMO_RESPONSES['default'];
                    
                    // Customize the response for the specific domain
                    if (domain !== demoData.domain) {
                        demoData = {
                            ...demoData,
                            domain: domain,
                            tcUrl: `https://${domain}/terms`
                        };
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
if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get(['perplexityApiKey'], (result) => {
        if (!result.perplexityApiKey) {
            console.log('No API key found, enabling demo mode');
            enableDemoMode();
        }
    });
}

// Export for manual enabling
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { enableDemoMode, DEMO_RESPONSES };
} 