// theme.js

// Constants (adjust if needed, these are likely in script.js currently)
const CONFIG = {
    FONT: {
        MIN_SIZE: 12,
        MAX_SIZE: 24,
        STEP: 2,
        DEFAULT: 16
    }
};

// State (related to theme and font size)
const STATE = {
    currentFontSize: CONFIG.FONT.DEFAULT // Initialize with default
};

// Function to apply the saved theme from localStorage
function applySavedTheme() {
    const html = document.documentElement;
    // Get saved theme, default to 'dark' if not found
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    // Update the theme toggle switch based on the applied theme
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'light';
    }
}

// Function to change font size
function changeFontSize(direction) {
    if (direction === 'increase' && STATE.currentFontSize < CONFIG.FONT.MAX_SIZE) {
        STATE.currentFontSize += CONFIG.FONT.STEP;
    } else if (direction === 'decrease' && STATE.currentFontSize > CONFIG.FONT.MIN_SIZE) {
        STATE.currentFontSize -= CONFIG.FONT.STEP;
    }

    // Apply font size to all elements that should be affected (e.g., note textareas, titles)
    // Use a class if possible for better targeting, or target specific elements
    const elementsToResize = document.querySelectorAll('.note-textarea, .title-input, .saved-note-text, .saved-note-title-display');
    elementsToResize.forEach(element => {
        element.style.fontSize = `${STATE.currentFontSize}px`;
    });

    // Save font size preference to localStorage
    localStorage.setItem('noteFontSize', STATE.currentFontSize);

    // Update the font size display
    updateFontSizeDisplay();
}

// Function to initialize font size from localStorage
function initializeFontSize() {
    const savedFontSize = localStorage.getItem('noteFontSize');
    if (savedFontSize) {
        STATE.currentFontSize = parseInt(savedFontSize);
        // Apply the saved font size immediately
        const elementsToResize = document.querySelectorAll('.note-textarea, .title-input, .saved-note-text, .saved-note-title-display');
         elementsToResize.forEach(element => {
             element.style.fontSize = `${STATE.currentFontSize}px`;
         });
    }
     // Update the font size display on load
     updateFontSizeDisplay();
}


// Function to update the font size display
function updateFontSizeDisplay() {
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    if (fontSizeDisplay) {
        fontSizeDisplay.textContent = `${STATE.currentFontSize}px`;
    }
}

// Function to initialize font size controls and theme toggle
function initializeSettingsPanel() {
    // Initialize font size from localStorage and set up buttons
    initializeFontSize();

    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    const increaseFontBtn = document.getElementById('increaseFontBtn');

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => changeFontSize('decrease'));
    }

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => changeFontSize('increase'));
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    if (themeToggle) {
         // Add event listener for theme toggle
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }


    // Settings panel toggle
    const settingsBtn = document.getElementById('fontSettingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');

    if (settingsBtn && settingsPanel && closeSettingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
             e.stopPropagation(); // Prevent click from closing immediately
            settingsPanel.classList.toggle('show');
        });

        closeSettingsBtn.addEventListener('click', function() {
            settingsPanel.classList.remove('show');
        });

        // Close settings when clicking outside
        document.addEventListener('click', function(e) {
             // Check if the click is outside the panel AND the button
            if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsPanel.classList.remove('show');
            }
        });
         // Prevent clicks inside the panel from closing it
         settingsPanel.addEventListener('click', function(e) {
             e.stopPropagation();
         });
    }
}

// Apply theme and initialize settings on DOM load
document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    initializeSettingsPanel();
});
