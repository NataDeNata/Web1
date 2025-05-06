// Font size settings functionality
document.addEventListener('DOMContentLoaded', function() {
    // Font size controls
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const noteContainers = document.querySelectorAll('.note-container');
    const noteTextareas = document.querySelectorAll('.note-textarea');
    const titleInputs = document.querySelectorAll('.title-input');

    // Font size levels in pixels
    const fontSizes = [14, 16, 18, 20];
    const fontLabels = {
        '14': 'Small',
        '16': 'Medium',
        '18': 'Large',
        '20': 'X-Large'
    };

    // Get saved font size or default to medium (16px)
    let currentFontIndex = fontSizes.indexOf(parseInt(localStorage.getItem('fontSize')) || 16);
    if (currentFontIndex === -1) currentFontIndex = 1; // Default to medium

    // Update font size display and apply to notes
    function updateFontSize() {
        const size = fontSizes[currentFontIndex];
        fontSizeDisplay.textContent = fontLabels[size];
        
        // Apply font size to note containers
        noteContainers.forEach(container => {
            container.style.fontSize = `${size}px`;
        });

        // Apply font size to textareas and inputs
        noteTextareas.forEach(textarea => {
            textarea.style.fontSize = `${size}px`;
        });

        titleInputs.forEach(input => {
            input.style.fontSize = `${size}px`;
        });

        // Save preference
        localStorage.setItem('fontSize', size);
    }

    // Initialize font size
    updateFontSize();

    // Font size button event listeners
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => {
            if (currentFontIndex > 0) {
                currentFontIndex--;
                updateFontSize();
            }
        });
    }

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => {
            if (currentFontIndex < fontSizes.length - 1) {
                currentFontIndex++;
                updateFontSize();
            }
        });
    }
}); 