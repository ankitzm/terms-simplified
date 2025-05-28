console.log('Terms Simplified Background Script Started');

// Configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Store API key (from environment or user settings)
let apiKey = null;

// Initialize with environment configuration
async function initializeApiKey() {
    // First check for user-configured API key
    try {
        const result = await chrome.storage.sync.get(['perplexityApiKey']);
        if (result.perplexityApiKey) {
            apiKey = result.perplexityApiKey;
            return;
        }
    } catch (error) {
        console.log('Could not access chrome storage for API key');
    }

    // If no user key, check for environment default (developers can set this)
    // You can uncomment and set your API key here for development:
    // apiKey = 'pplx-your-api-key-here';
}

// Initialize on startup
initializeApiKey();

// Load API key from storage or environment
chrome.storage.sync.get(['perplexityApiKey'], (result) => {
    if (result.perplexityApiKey) {
        apiKey = result.perplexityApiKey;
    } else {
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
            await initializeApiKey();
            if (!apiKey) {
                throw new Error('Please set your Perplexity API key. Go to extension options and add your API key.');
            }
        }

        // Step 1: Find Terms and Conditions URL
        updateProgress('Finding terms and conditions...');
        const tcUrl = await findTermsAndConditions(domain);

        // Step 2: Get and analyze Terms and Conditions content
        updateProgress('Analyzing with AI...');
        const analysis = await analyzeTermsAndConditions(domain, tcUrl);

        // Step 3: Parse structured analysis from response
        updateProgress('Processing analysis results...');
        const structuredAnalysis = parseStructuredAnalysis(analysis);

        return {
            domain: domain,
            tcUrl: tcUrl,
            analysis: structuredAnalysis,
            rawAnalysis: analysis
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

// Function to analyze Terms and Conditions with improved prompt
async function analyzeTermsAndConditions(domain, tcUrl) {
    const enhancedPrompt = `Act as an expert legal analyst specializing in consumer protection and digital rights. Your task is to perform a comprehensive analysis of the Terms and Conditions for ${domain} found at ${tcUrl} to identify potentially problematic, unfair, or legally concerning clauses that may disadvantage users.

Analyze the T&C document systematically and present your findings in the following structured format:

**ANALYSIS STRUCTURE:**

For each identified issue, provide:
1. **Issue Category** (as the heading)
2. **Risk Level** (High/Medium/Low)
3. **Exact Phrase(s)** (direct quotes from the document)
4. **Issue Explanation** (why this is problematic)
5. **Potential Impact** (consequences for users)

**FOCUS AREAS FOR ANALYSIS:**

1. Data Rights and Privacy Violations
   - Excessive data collection permissions
   - Unclear data sharing practices
   - Inadequate user control over personal information

2. Unfair Liability and Indemnification
   - One-sided liability limitations
   - Excessive user indemnification requirements
   - Unreasonable damage exclusions

3. Termination and Account Control
   - Arbitrary termination rights
   - Lack of appeal processes
   - Unclear account suspension criteria

4. Intellectual Property Overreach
   - Excessive content licensing
   - Unclear ownership of user-generated content
   - Broad usage rights claims

5. Dispute Resolution Restrictions
   - Mandatory arbitration clauses
   - Class action waivers
   - Jurisdiction limitations

6. Automatic Renewals and Billing
   - Hidden auto-renewal terms
   - Unclear cancellation processes
   - Unfair refund policies

7. Service Modification Rights
   - Unilateral service change rights
   - Inadequate notice requirements
   - Price change provisions

**OUTPUT FORMAT:**

## 1. [ISSUE CATEGORY NAME]
**Risk Level:** [High/Medium/Low]
**Exact Phrase:** "[Insert exact quote from T&C]"
**Issue Explanation:** [Explain why this clause is problematic]
**Potential Impact:** [Describe consequences for users]

Continue this format for all identified issues. If no significant issues are found, provide a brief summary of what was reviewed.

Please analyze the Terms and Conditions for ${domain} and provide your findings in the specified format.`;

    try {
        const response = await callPerplexityAPI([{
            role: 'user',
            content: enhancedPrompt
        }], 'llama-3.1-sonar-large-128k-online');

        return response.choices[0].message.content;
    } catch (error) {
        throw new Error(`Failed to analyze T&C: ${error.message}`);
    }
}

// Function to parse structured analysis into organized data
function parseStructuredAnalysis(analysisText) {
    const issues = [];
    const lines = analysisText.split('\n');
    let currentIssue = null;
    let currentField = null;

    for (const line of lines) {
        const trimmed = line.trim();
        
        if (!trimmed) continue;

        // Check for issue headers (## 1. ISSUE NAME)
        const issueMatch = trimmed.match(/^##\s*\d+\.\s*(.+)$/);
        if (issueMatch) {
            // Save previous issue if exists
            if (currentIssue && currentIssue.title) {
                issues.push(currentIssue);
            }
            
            // Start new issue
            currentIssue = {
                title: issueMatch[1].trim(),
                riskLevel: '',
                exactPhrase: '',
                explanation: '',
                impact: ''
            };
            continue;
        }

        if (!currentIssue) continue;

        // Check for field headers
        if (trimmed.startsWith('**Risk Level:**')) {
            currentField = 'riskLevel';
            currentIssue.riskLevel = trimmed.replace('**Risk Level:**', '').trim();
        } else if (trimmed.startsWith('**Exact Phrase:**')) {
            currentField = 'exactPhrase';
            currentIssue.exactPhrase = trimmed.replace('**Exact Phrase:**', '').trim().replace(/^"|"$/g, '');
        } else if (trimmed.startsWith('**Issue Explanation:**')) {
            currentField = 'explanation';
            currentIssue.explanation = trimmed.replace('**Issue Explanation:**', '').trim();
        } else if (trimmed.startsWith('**Potential Impact:**')) {
            currentField = 'impact';
            currentIssue.impact = trimmed.replace('**Potential Impact:**', '').trim();
        } else if (currentField && trimmed && !trimmed.startsWith('**')) {
            // Continue previous field
            if (currentIssue[currentField]) {
                currentIssue[currentField] += ' ' + trimmed;
            } else {
                currentIssue[currentField] = trimmed;
            }
        }
    }

    // Add the last issue
    if (currentIssue && currentIssue.title) {
        issues.push(currentIssue);
    }

    // If no structured issues found, create a general summary
    if (issues.length === 0) {
        issues.push({
            title: 'General Analysis',
            riskLevel: 'Medium',
            exactPhrase: 'Full document reviewed',
            explanation: 'The terms and conditions were analyzed for potential issues.',
            impact: 'Review the terms carefully for data usage, cancellation policies, and liability limitations.'
        });
    }

    return issues;
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
            max_tokens: 2000,
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
