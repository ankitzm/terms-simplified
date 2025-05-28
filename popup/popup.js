// DOM elements
const mainContainer = document.getElementById('mainContainer');
const loadingContainer = document.getElementById('loadingContainer');
const resultsContainer = document.getElementById('resultsContainer');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingText = document.getElementById('loadingText');
const flawsList = document.getElementById('flawsList');
const backBtn = document.getElementById('backBtn');

// Loading states
const loadingStates = [
    'Loading T&C...',
    'Finding terms and conditions...',
    'Analyzing with AI...',
    'Looking for potential issues...',
    'Summarizing findings...'
];

let loadingStateIndex = 0;
let loadingInterval;

// Event listeners
analyzeBtn.addEventListener('click', async () => {
    try {
        // Get current tab URL
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            showError('Unable to get current tab information');
            return;
        }

        showLoading();
        
        // Send message to background script to analyze T&C
        chrome.runtime.sendMessage({
            action: 'analyzeTC',
            url: tab.url,
            domain: new URL(tab.url).hostname
        }, (response) => {
            hideLoading();
            
            if (chrome.runtime.lastError) {
                showError('Extension error: ' + chrome.runtime.lastError.message);
                return;
            }
            
            if (response && response.success) {
                showResults(response.data);
            } else {
                showError(response?.error || 'Failed to analyze terms and conditions');
            }
        });
    } catch (error) {
        hideLoading();
        showError('Error: ' + error.message);
    }
});

backBtn.addEventListener('click', () => {
    showMain();
});

// UI state management functions
function showMain() {
    mainContainer.style.display = 'flex';
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
}

function showLoading() {
    mainContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';
    resultsContainer.style.display = 'none';
    
    loadingStateIndex = 0;
    loadingText.textContent = loadingStates[0];
    
    // Cycle through loading states
    loadingInterval = setInterval(() => {
        loadingStateIndex = (loadingStateIndex + 1) % loadingStates.length;
        loadingText.textContent = loadingStates[loadingStateIndex];
    }, 2000);
}

function hideLoading() {
    if (loadingInterval) {
        clearInterval(loadingInterval);
        loadingInterval = null;
    }
}

function showResults(data) {
    mainContainer.style.display = 'none';
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    // Clear previous results
    flawsList.innerHTML = '';
    
    if (data.flaws && data.flaws.length > 0) {
        data.flaws.forEach(flaw => {
            const flawElement = document.createElement('div');
            flawElement.className = 'flaw-item';
            flawElement.textContent = flaw;
            flawsList.appendChild(flawElement);
        });
    } else {
        const noFlawsElement = document.createElement('div');
        noFlawsElement.className = 'flaw-item';
        noFlawsElement.style.borderLeftColor = '#4ade80';
        noFlawsElement.textContent = '✅ No major issues found in the terms and conditions!';
        flawsList.appendChild(noFlawsElement);
    }
}

function showError(message) {
    mainContainer.style.display = 'none';
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    const resultsTitle = document.querySelector('.results-title');
    resultsTitle.textContent = '❌ Error';
    
    flawsList.innerHTML = '';
    const errorElement = document.createElement('div');
    errorElement.className = 'flaw-item';
    errorElement.style.borderLeftColor = '#f87171';
    errorElement.textContent = message;
    flawsList.appendChild(errorElement);
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    showMain();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateProgress') {
        if (loadingContainer.style.display === 'flex') {
            loadingText.textContent = message.text;
        }
    }
}); 