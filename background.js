console.log('Terms Simplified Background Script Started');

// Configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Store API key (you'll need to set this)
let apiKey = null;

// Load API key from storage or set it
chrome.storage.sync.get(['perplexityApiKey'], (result) => {
    if (result.perplexityApiKey) {
        apiKey = result.perplexityApiKey;
    } else {
        // For now, we'll prompt user to set API key
        console.log('Please set your Perplexity API key in the extension options');
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzeTC') {
        handleAnalyzeTC(message.domain, message.url)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => {
                console.error('Error analyzing T&C:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
});

// Main function to analyze Terms & Conditions
async function handleAnalyzeTC(domain, url) {
    try {
        // Check if API key is available
        if (!apiKey) {
            // Try to get API key from storage again
            const result = await chrome.storage.sync.get(['perplexityApiKey']);
            if (result.perplexityApiKey) {
                apiKey = result.perplexityApiKey;
            } else {
                throw new Error('Please set your Perplexity API key. Go to extension options and add your API key.');
            }
        }

        // Step 1: Find Terms and Conditions URL
        updateProgress('Finding terms and conditions...');
        const tcUrl = await findTermsAndConditions(domain);

        // Step 2: Get and analyze Terms and Conditions content
        updateProgress('Analyzing with AI...');
        const analysis = await analyzeTermsAndConditions(domain, tcUrl);

        // Step 3: Extract flaws from analysis
        updateProgress('Identifying potential issues...');
        const flaws = extractFlaws(analysis);

        return {
            domain: domain,
            tcUrl: tcUrl,
            flaws: flaws,
            fullAnalysis: analysis
        };

    } catch (error) {
        console.error('Error in handleAnalyzeTC:', error);
        throw error;
    }
}

// Function to find Terms and Conditions URL for a website
async function findTermsAndConditions(domain) {
    const query = `Find the terms and conditions URL for ${domain}. Return only the direct URL to their terms of service or terms and conditions page. If you cannot find one, return "NOT_FOUND".`;

    try {
        const response = await callPerplexityAPI([{
            role: 'user',
            content: query
        }], 'llama-3.1-sonar-small-128k-online');

        const tcUrl = response.choices[0].message.content.trim();
        
        if (tcUrl === 'NOT_FOUND' || !tcUrl.includes('http')) {
            throw new Error(`No terms and conditions found for ${domain}`);
        }

        return tcUrl;
    } catch (error) {
        throw new Error(`Failed to find T&C for ${domain}: ${error.message}`);
    }
}

// Function to analyze Terms and Conditions
async function analyzeTermsAndConditions(domain, tcUrl) {
    const query = `Please analyze the terms and conditions for ${domain} found at ${tcUrl}. 

Focus on identifying potential issues that could be harmful to users such as:
- Excessive data collection or sharing
- Unfair termination clauses
- Liability limitations that seem unreasonable
- Automatic renewals or billing issues
- Intellectual property overreach
- Dispute resolution limitations
- Privacy concerns
- Unclear refund policies

Provide a concise analysis highlighting the main concerns. Keep the response under 500 words and focus on actionable insights for users.`;

    try {
        const response = await callPerplexityAPI([{
            role: 'user',
            content: query
        }], 'llama-3.1-sonar-large-128k-online');

        return response.choices[0].message.content;
    } catch (error) {
        throw new Error(`Failed to analyze T&C: ${error.message}`);
    }
}

// Function to extract specific flaws from analysis
function extractFlaws(analysis) {
    // Use simple text processing to extract bullet points or key issues
    const flaws = [];
    
    // Look for common patterns that indicate issues
    const lines = analysis.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines
        if (!trimmed) continue;
        
        // Look for bullet points, numbered lists, or sentences with concern keywords
        if (trimmed.match(/^[-•*]\s/) || 
            trimmed.match(/^\d+\.\s/) ||
            trimmed.toLowerCase().includes('concern') ||
            trimmed.toLowerCase().includes('issue') ||
            trimmed.toLowerCase().includes('problematic') ||
            trimmed.toLowerCase().includes('unfair') ||
            trimmed.toLowerCase().includes('excessive') ||
            trimmed.toLowerCase().includes('limitation') ||
            trimmed.toLowerCase().includes('unclear')) {
            
            // Clean up the text
            let flaw = trimmed.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '');
            
            // Only add if it's substantial (more than 10 characters)
            if (flaw.length > 10 && flaw.length < 200) {
                flaws.push(flaw);
            }
        }
    }
    
    // If no structured flaws found, try to extract sentences with warning keywords
    if (flaws.length === 0) {
        const sentences = analysis.split(/[.!?]+/);
        for (const sentence of sentences) {
            const trimmed = sentence.trim();
            if (trimmed.length > 20 && trimmed.length < 150 && 
                (trimmed.toLowerCase().includes('may') || 
                 trimmed.toLowerCase().includes('could') ||
                 trimmed.toLowerCase().includes('allows') ||
                 trimmed.toLowerCase().includes('requires'))) {
                flaws.push(trimmed);
                if (flaws.length >= 3) break; // Limit to 3 flaws
            }
        }
    }
    
    // Fallback: if still no flaws, provide a general summary
    if (flaws.length === 0) {
        flaws.push('Review the terms carefully for data usage, cancellation policies, and liability limitations.');
    }
    
    return flaws.slice(0, 5); // Limit to 5 flaws maximum
}

// Function to call Perplexity API
async function callPerplexityAPI(messages, model = 'llama-3.1-sonar-small-128k-online') {
    if (!apiKey) {
        throw new Error('Perplexity API key not configured');
    }

    const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.2,
            stream: false
        })
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorData}`);
    }

    return await response.json();
}

// Function to update progress in popup
function updateProgress(text) {
    chrome.runtime.sendMessage({
        action: 'updateProgress',
        text: text
    }).catch(() => {
        // Ignore errors if popup is closed
    });
}

// Function to set API key (can be called from options page)
function setApiKey(key) {
    apiKey = key;
    chrome.storage.sync.set({ perplexityApiKey: key });
}

// Expose function for options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setApiKey') {
        setApiKey(message.apiKey);
        sendResponse({ success: true });
    }
});

console.log('Background script ready');
