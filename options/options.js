// DOM elements
const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');
const form = document.getElementById('optionsForm');

// Load saved API key on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSavedApiKey();
});

// Form submission handler
form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveApiKey();
});

// Load saved API key from storage
function loadSavedApiKey() {
    chrome.storage.sync.get(['perplexityApiKey'], (result) => {
        if (result.perplexityApiKey) {
            // Mask the API key for security (show only first 8 and last 4 characters)
            const maskedKey = maskApiKey(result.perplexityApiKey);
            apiKeyInput.value = maskedKey;
            apiKeyInput.placeholder = 'API key is set (masked for security)';
        }
    });
}

// Save API key to storage
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        showStatus('Please enter an API key', 'error');
        return;
    }
    
    // Validate API key format (Perplexity keys start with 'pplx-')
    if (!apiKey.startsWith('pplx-') && !apiKey.includes('*')) {
        showStatus('Invalid API key format. Perplexity API keys should start with "pplx-"', 'error');
        return;
    }
    
    // Don't save if it's a masked key
    if (apiKey.includes('*')) {
        showStatus('API key is already saved', 'success');
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    // Save to storage
    chrome.storage.sync.set({ perplexityApiKey: apiKey }, () => {
        if (chrome.runtime.lastError) {
            showStatus('Failed to save API key: ' + chrome.runtime.lastError.message, 'error');
        } else {
            // Notify background script about the new API key
            chrome.runtime.sendMessage({
                action: 'setApiKey',
                apiKey: apiKey
            }, (response) => {
                if (response && response.success) {
                    showStatus('API key saved successfully!', 'success');
                    // Mask the key in the input field
                    apiKeyInput.value = maskApiKey(apiKey);
                    apiKeyInput.placeholder = 'API key is set (masked for security)';
                } else {
                    showStatus('Failed to configure API key in background script', 'error');
                }
            });
        }
        
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Configuration';
    });
}

// Show status message
function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    // Hide status after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }
}

// Mask API key for security
function maskApiKey(apiKey) {
    if (apiKey.length <= 12) {
        return '*'.repeat(apiKey.length);
    }
    
    const start = apiKey.substring(0, 8);
    const end = apiKey.substring(apiKey.length - 4);
    const middle = '*'.repeat(apiKey.length - 12);
    
    return start + middle + end;
}

// Clear API key function (for testing or reset)
function clearApiKey() {
    chrome.storage.sync.remove(['perplexityApiKey'], () => {
        apiKeyInput.value = '';
        apiKeyInput.placeholder = 'pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
        showStatus('API key cleared', 'success');
    });
}

// Add a clear button (hidden by default, can be shown for debugging)
if (window.location.search.includes('debug=true')) {
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear API Key';
    clearBtn.type = 'button';
    clearBtn.style.marginLeft = '10px';
    clearBtn.onclick = clearApiKey;
    saveBtn.parentNode.appendChild(clearBtn);
} 