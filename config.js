// Configuration for Terms Simplified Extension

export const CONFIG = {
    PERPLEXITY_API_URL: 'https://api.perplexity.ai/chat/completions',
    MODELS: {
        SMALL: 'llama-3.1-sonar-small-128k-online',
        LARGE: 'llama-3.1-sonar-large-128k-online'
    },
    API_LIMITS: {
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.2,
        TIMEOUT: 30000 // 30 seconds
    },
    UI: {
        POPUP_WIDTH: 400,
        POPUP_HEIGHT: 600,
        LOADING_STATE_INTERVAL: 2000 // 2 seconds
    },
    CACHE: {
        ENABLED: false, // Future feature
        TTL: 24 * 60 * 60 * 1000 // 24 hours
    }
};

export const PROMPTS = {
    FIND_TC: (domain) => `Find the terms and conditions URL for ${domain}. Return only the direct URL to their terms of service or terms and conditions page. If you cannot find one, return "NOT_FOUND".`,
    
    ANALYZE_TC: (domain, tcUrl) => `Please analyze the terms and conditions for ${domain} found at ${tcUrl}. 

Focus on identifying potential issues that could be harmful to users such as:
- Excessive data collection or sharing
- Unfair termination clauses
- Liability limitations that seem unreasonable
- Automatic renewals or billing issues
- Intellectual property overreach
- Dispute resolution limitations
- Privacy concerns
- Unclear refund policies

Provide a concise analysis highlighting the main concerns. Keep the response under 500 words and focus on actionable insights for users.`
}; 