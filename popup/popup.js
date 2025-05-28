// DOM elements
const mainContainer = document.getElementById('mainContainer');
const loadingContainer = document.getElementById('loadingContainer');
const resultsContainer = document.getElementById('resultsContainer');
const errorContainer = document.getElementById('errorContainer');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingText = document.getElementById('loadingText');
const analysisList = document.getElementById('analysisList');
const domainInfo = document.getElementById('domainInfo');
const backBtn = document.getElementById('backBtn');
const errorBackBtn = document.getElementById('errorBackBtn');
const errorMessage = document.getElementById('errorMessage');

// Loading states
const loadingStates = [
    'Loading T&C...',
    'Finding terms and conditions...',
    'Analyzing with AI...',
    'Looking for potential issues...',
    'Processing results...'
];

let loadingStateIndex = 0;
let loadingInterval;
let currentExpandedItem = null;

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

errorBackBtn.addEventListener('click', () => {
    showMain();
});

// UI state management functions
function showMain() {
    mainContainer.style.display = 'flex';
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'none';
}

function showLoading() {
    mainContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    
    loadingStateIndex = 0;
    loadingText.textContent = loadingStates[0];
    
    // Cycle through loading states
    loadingInterval = setInterval(() => {
        loadingStateIndex = (loadingStateIndex + 1) % loadingStates.length;
        loadingText.textContent = loadingStates[loadingStateIndex];
    }, 2500);
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
    errorContainer.style.display = 'none';
    
    // Update domain info
    domainInfo.textContent = `Analysis for ${data.domain}`;
    
    // Clear previous results
    analysisList.innerHTML = '';
    currentExpandedItem = null;
    
    if (data.analysis && data.analysis.length > 0) {
        data.analysis.forEach((issue, index) => {
            const analysisItem = createAnalysisItem(issue, index);
            analysisList.appendChild(analysisItem);
        });
    } else {
        const noIssuesElement = document.createElement('div');
        noIssuesElement.className = 'analysis-item';
        noIssuesElement.innerHTML = `
            <div class="analysis-header">
                <div class="analysis-title">✅ No major issues found</div>
                <span class="risk-badge risk-low">Low</span>
            </div>
        `;
        analysisList.appendChild(noIssuesElement);
    }
}

function createAnalysisItem(issue, index) {
    console.log('Creating analysis item:', index, issue.title);
    
    const item = document.createElement('div');
    item.className = 'analysis-item';
    item.dataset.index = index;
    
    // Determine risk level class
    const riskLevel = (issue.riskLevel || 'medium').toLowerCase();
    const riskClass = `risk-${riskLevel}`;
    
    // Create risk icon based on level
    const riskIcon = riskLevel === 'high' ? '🔴' : 
                     riskLevel === 'low' ? '🟢' : '🟡';
    
    // Create header element
    const headerElement = document.createElement('div');
    headerElement.className = 'analysis-header';
    headerElement.innerHTML = `
        <div class="analysis-title">
            ${riskIcon} ${issue.title || 'Unknown Issue'}
        </div>
        <span class="risk-badge ${riskClass}">
            ${(issue.riskLevel || 'Medium').toUpperCase()}
        </span>
        <span class="expand-icon">▼</span>
    `;
    
    // Create details element
    const detailsElement = document.createElement('div');
    detailsElement.className = 'analysis-details';
    detailsElement.id = `details-${index}`;
    
    let detailsHTML = '';
    if (issue.exactPhrase) {
        detailsHTML += `
            <div class="detail-section">
                <div class="detail-label">Exact Phrase</div>
                <div class="detail-content exact-phrase">"${issue.exactPhrase}"</div>
            </div>
        `;
    }
    if (issue.explanation) {
        detailsHTML += `
            <div class="detail-section">
                <div class="detail-label">Issue Explanation</div>
                <div class="detail-content">${issue.explanation}</div>
            </div>
        `;
    }
    if (issue.impact) {
        detailsHTML += `
            <div class="detail-section">
                <div class="detail-label">Potential Impact</div>
                <div class="detail-content">${issue.impact}</div>
            </div>
        `;
    }
    detailsElement.innerHTML = detailsHTML;
    
    // Add click event listener to header
    headerElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Header clicked for item:', index);
        toggleAnalysisItem(index);
    });
    
    // Append elements to item
    item.appendChild(headerElement);
    item.appendChild(detailsElement);
    
    console.log('Analysis item created successfully:', index);
    return item;
}

// Function to toggle analysis items
function toggleAnalysisItem(index) {
    console.log('Toggling analysis item:', index);
    
    const detailsElement = document.getElementById(`details-${index}`);
    const item = document.querySelector(`[data-index="${index}"]`);
    const expandIcon = item?.querySelector('.expand-icon');
    
    if (!detailsElement || !item || !expandIcon) {
        console.error('Missing elements for toggle:', { detailsElement, item, expandIcon });
        return;
    }
    
    // Close currently expanded item if different
    if (currentExpandedItem !== null && currentExpandedItem !== index) {
        console.log('Closing previously expanded item:', currentExpandedItem);
        const currentDetails = document.getElementById(`details-${currentExpandedItem}`);
        const currentItem = document.querySelector(`[data-index="${currentExpandedItem}"]`);
        const currentIcon = currentItem?.querySelector('.expand-icon');
        
        if (currentDetails) {
            currentDetails.classList.remove('expanded');
        }
        if (currentIcon) {
            currentIcon.classList.remove('expanded');
        }
    }
    
    // Toggle current item
    const isExpanded = detailsElement.classList.contains('expanded');
    console.log('Current expanded state:', isExpanded);
    
    if (isExpanded) {
        detailsElement.classList.remove('expanded');
        expandIcon.classList.remove('expanded');
        currentExpandedItem = null;
        console.log('Collapsed item:', index);
    } else {
        detailsElement.classList.add('expanded');
        expandIcon.classList.add('expanded');
        currentExpandedItem = index;
        console.log('Expanded item:', index);
    }
}

function showError(message) {
    mainContainer.style.display = 'none';
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    
    errorMessage.textContent = message;
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