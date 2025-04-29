// Constants and configuration
const CONFIG = {
    MAX_NOTES: 12,
    FONT: {
        MIN_SIZE: 12,
        MAX_SIZE: 24,
        STEP: 2,
        DEFAULT: 16
    },
    ANIMATION: {
        DURATION: 300,
        DELAY: 100
    }
};

// DOM Elements - cache selectors
const DOM = {
    noteContainers: document.querySelector('.note-containers'),
    createNoteButton: document.querySelector('.btn'),
    body: document.body,
    html: document.documentElement
};

// State management
const STATE = {
    noteCount: 0,
    currentFontSize: CONFIG.FONT.DEFAULT,
    ticking: false,
    imageFocusElements: null
};

// Utility functions
const utils = {
    // Debounce function to limit how often a function can be called
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function to limit how often a function can be called
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Create element with attributes
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Append children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }
};

// Function to close all dropdowns
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    const dropdownIcons = document.querySelectorAll('.dropdown-button img');
    
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
    });
    
    dropdownIcons.forEach(icon => {
        icon.src = 'dropDown.png';
        icon.alt = 'Menu';
    });
}

// Create image focus elements
function createImageFocusElements() {
    // Create overlay
    const overlay = utils.createElement('div', {
        className: 'image-focus-overlay'
    });
    
    // Create focused image container
    const focusedContainer = utils.createElement('div', {
        className: 'focused-image-container'
    });
    
    const focusedImg = utils.createElement('img');
    focusedContainer.appendChild(focusedImg);
    
    // Create close button for mobile
    const closeBtn = utils.createElement('div', {
        className: 'image-close-btn',
        textContent: '×',
        style: {
            display: 'none' // Hidden by default, shown on mobile
        }
    });
    focusedContainer.appendChild(closeBtn);
    
    // Create zoom controls for desktop
    const zoomControls = utils.createElement('div', {
        className: 'zoom-controls',
        style: {
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '20px',
            padding: '5px 10px',
            zIndex: '10000',
            display: 'none' // Hidden by default, shown on desktop
        }
    });
    
    // Zoom out button
    const zoomOutBtn = utils.createElement('button', {
        className: 'zoom-btn',
        textContent: '−',
        style: {
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 10px',
            margin: '0 5px'
        }
    });
    
    // Zoom indicator
    const zoomIndicator = utils.createElement('span', {
        className: 'zoom-indicator',
        textContent: '100%',
        style: {
            color: 'white',
            fontSize: '14px',
            margin: '0 10px',
            minWidth: '50px',
            textAlign: 'center'
        }
    });
    
    // Zoom in button
    const zoomInBtn = utils.createElement('button', {
        className: 'zoom-btn',
        textContent: '+',
        style: {
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 10px',
            margin: '0 5px'
        }
    });
    
    // Reset zoom button
    const resetZoomBtn = utils.createElement('button', {
        className: 'reset-zoom-btn',
        textContent: 'Reset',
        style: {
            backgroundColor: 'transparent',
            border: '1px solid white',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '2px 8px',
            margin: '0 5px',
            borderRadius: '4px'
        }
    });
    
    // Delete image button
    const deleteImageBtn = utils.createElement('button', {
        className: 'delete-image-btn',
        textContent: 'Delete',
        style: {
            backgroundColor: 'rgba(255, 0, 0, 0.7)',
            border: 'none',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '2px 8px',
            margin: '0 5px',
            borderRadius: '4px'
        }
    });
    
    // Add buttons to zoom controls
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomIndicator);
    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(resetZoomBtn);
    zoomControls.appendChild(deleteImageBtn);
    
    // Add zoom controls to focused container
    focusedContainer.appendChild(zoomControls);
    
    // Create tooltip element
    const tooltip = utils.createElement('div', {
        className: 'image-tooltip',
        textContent: 'Click to zoom in image',
        style: {
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: '10',
            display: 'none'
        }
    });
    
    // Variables for touch handling
    let initialScale = 1;
    let currentScale = 1;
    let initialDistance = 0;
    let initialX = 0;
    let initialY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    
    // Close focused image when clicking overlay
    overlay.addEventListener('click', function() {
        closeFocusedImage();
    });
    
    // Close button event
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeFocusedImage();
    });
    
    // Delete image button event
    deleteImageBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (STATE.imageFocusElements.currentImage) {
            // Get the note container from the image
            const noteContainer = STATE.imageFocusElements.currentImage.closest('.note-container');
            const titleInput = noteContainer.querySelector('.title-input');
            const noteTextArea = noteContainer.querySelector('.note-textarea');
            
            // Delete the image
            deleteImage(noteContainer, titleInput, noteTextArea);
        }
    });
    
    // Function to close the focused image
    function closeFocusedImage() {
        overlay.style.display = 'none';
        focusedContainer.style.display = 'none';
        // Reset scale and position
        currentScale = 1;
        currentX = 0;
        currentY = 0;
        updateImageTransform();
        updateZoomIndicator();
    }
    
    // Function to update image transform
    function updateImageTransform() {
        focusedImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
    }
    
    // Function to update zoom indicator
    function updateZoomIndicator() {
        zoomIndicator.textContent = `${Math.round(currentScale * 100)}%`;
    }
    
    // Function to zoom in
    function zoomIn() {
        if (currentScale < 5) {
            currentScale = Math.min(currentScale + 0.25, 5);
            updateImageTransform();
            updateZoomIndicator();
        }
    }
    
    // Function to zoom out
    function zoomOut() {
        if (currentScale > 0.5) {
            currentScale = Math.max(currentScale - 0.25, 0.5);
            updateImageTransform();
            updateZoomIndicator();
        }
    }
    
    // Function to reset zoom
    function resetZoom() {
        currentScale = 1;
        currentX = 0;
        currentY = 0;
        updateImageTransform();
        updateZoomIndicator();
    }
    
    // Add zoom button event listeners
    zoomInBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        zoomIn();
    });
    
    zoomOutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        zoomOut();
    });
    
    resetZoomBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        resetZoom();
    });
    
    // Add mouse wheel zoom for desktop
    focusedContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        // Check if Ctrl key is pressed (for zoom)
        if (e.ctrlKey) {
            if (e.deltaY < 0) {
                // Zoom in
                zoomIn();
            } else {
                // Zoom out
                zoomOut();
            }
        } else {
            // Pan the image if not zooming
            currentX -= e.deltaX * 0.5;
            currentY -= e.deltaY * 0.5;
            
            // Limit panning based on scale
            const maxPan = (currentScale - 1) * 200;
            currentX = Math.min(Math.max(currentX, -maxPan), maxPan);
            currentY = Math.min(Math.max(currentY, -maxPan), maxPan);
            
            updateImageTransform();
        }
    });
    
    // Add keyboard shortcuts for zooming
    document.addEventListener('keydown', function(e) {
        // Only handle keyboard shortcuts when image is focused
        if (focusedContainer.style.display === 'block') {
            // Ctrl + Plus to zoom in
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                zoomIn();
            }
            // Ctrl + Minus to zoom out
            else if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                zoomOut();
            }
            // Ctrl + 0 to reset zoom
            else if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                resetZoom();
            }
            // Escape to close
            else if (e.key === 'Escape') {
                closeFocusedImage();
            }
        }
    });
    
    // Touch event handlers for pinch zoom and pan
    focusedContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            // Pinch gesture
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            initialScale = currentScale;
        } else if (e.touches.length === 1) {
            // Single touch for panning
            const touch = e.touches[0];
            initialX = currentX;
            initialY = currentY;
            initialX = touch.clientX;
            initialY = touch.clientY;
            isDragging = true;
        }
    });
    
    focusedContainer.addEventListener('touchmove', function(e) {
        e.preventDefault(); // Prevent default scrolling
        
        if (e.touches.length === 2) {
            // Pinch zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
            
            // Calculate new scale
            currentScale = initialScale * (currentDistance / initialDistance);
            
            // Limit scale between 1 and 5
            currentScale = Math.min(Math.max(currentScale, 1), 5);
            
            updateImageTransform();
            updateZoomIndicator();
        } else if (e.touches.length === 1 && isDragging) {
            // Pan
            const touch = e.touches[0];
            const deltaX = touch.clientX - initialX;
            const deltaY = touch.clientY - initialY;
            
            currentX = initialX + deltaX;
            currentY = initialY + deltaY;
            
            // Limit panning based on scale
            const maxPan = (currentScale - 1) * 100;
            currentX = Math.min(Math.max(currentX, -maxPan), maxPan);
            currentY = Math.min(Math.max(currentY, -maxPan), maxPan);
            
            updateImageTransform();
        }
    });
    
    focusedContainer.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    // Double tap to reset zoom
    let lastTap = 0;
    focusedContainer.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            resetZoom();
        }
        
        lastTap = currentTime;
    });
    
    // Show/hide controls based on screen size
    function updateControlsVisibility() {
        if (window.innerWidth <= 768) {
            closeBtn.style.display = 'flex';
            zoomControls.style.display = 'none';
        } else {
            closeBtn.style.display = 'none';
            zoomControls.style.display = 'flex';
        }
    }
    
    // Initial check and add resize listener
    updateControlsVisibility();
    window.addEventListener('resize', updateControlsVisibility);
    
    // Append elements to body
    DOM.body.appendChild(overlay);
    DOM.body.appendChild(focusedContainer);
    DOM.body.appendChild(tooltip);
    
    return { overlay, focusedContainer, focusedImg, tooltip, currentImage: null };
}

// Function to add click handlers to all images in note-textareas
function addImageClickHandlers() {
    const noteTextareas = document.querySelectorAll('.note-textarea');
    
    noteTextareas.forEach(textarea => {
        const images = textarea.querySelectorAll('img');
        
        images.forEach(img => {
            // Only add the handler if it doesn't already have one
            if (!img.hasAttribute('data-has-focus-handler')) {
                img.setAttribute('data-has-focus-handler', 'true');
                
                // Add click event
                img.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent note container from getting focus
                    
                    // Set the focused image source
                    STATE.imageFocusElements.focusedImg.src = this.src;
                    
                    // Show the overlay and focused image
                    STATE.imageFocusElements.overlay.style.display = 'block';
                    STATE.imageFocusElements.focusedContainer.style.display = 'block';
                    
                    // Store reference to the clicked image for deletion
                    STATE.imageFocusElements.currentImage = this;
                });
                
                // Add hover events for tooltip
                img.addEventListener('mouseenter', function(e) {
                    const tooltip = STATE.imageFocusElements.tooltip;
                    tooltip.style.display = 'block';
                    
                    // Position tooltip below the image
                    const rect = this.getBoundingClientRect();
                    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
                    tooltip.style.top = (rect.bottom + 10) + 'px';
                    tooltip.style.transform = 'translateX(-50%)';
                    
                    // Show tooltip with a slight delay
                    setTimeout(() => {
                        tooltip.style.opacity = '1';
                    }, CONFIG.ANIMATION.DELAY);
                });
                
                img.addEventListener('mouseleave', function() {
                    const tooltip = STATE.imageFocusElements.tooltip;
                    tooltip.style.opacity = '0';
                    
                    // Hide tooltip after fade out
                    setTimeout(() => {
                        if (tooltip.style.opacity === '0') {
                            tooltip.style.display = 'none';
                        }
                    }, CONFIG.ANIMATION.DURATION);
                });
            }
        });
    });
}

// Create a new note
function createNote() {
    if (STATE.noteCount < CONFIG.MAX_NOTES) {
        // Create note container
        const noteContainer = utils.createElement('div', {
            className: 'note-container'
        });
        
        // Apply responsive styles based on screen size
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            noteContainer.style.resize = 'none';
            noteContainer.style.overflow = 'auto';
            noteContainer.style.width = '90%';
            noteContainer.style.maxWidth = '100vw';
            noteContainer.style.minWidth = '90%';
            noteContainer.style.margin = '1rem auto';
            noteContainer.style.display = 'block';
            noteContainer.style.marginRight = '4ch';
        }

        // Create title bar container
        const titleBar = utils.createElement('div', {
            className: 'title-bar',
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '5px',
                position: 'relative'
            }
        });

        // Title area
        const titleInput = utils.createElement('input', {
            type: 'text',
            placeholder: 'Title',
            className: 'title-input',
            style: {
                flex: '1',
                marginRight: '10px'
            }
        });

        // Create a unique ID for this note's dropdown
        const dropdownId = `dropdown-${STATE.noteCount}`;

        // Dropdown button
        const dropdownButton = utils.createElement('button', {
            className: 'dropdown-button',
            'data-dropdown-id': dropdownId,
            style: {
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)'
            }
        });
        
        const dropdownIcon = utils.createElement('img', {
            src: 'dropDown.png',
            alt: 'Menu'
        });
        
        dropdownButton.appendChild(dropdownIcon);

        // Add title input and dropdown button to title bar
        titleBar.appendChild(titleInput);
        titleBar.appendChild(dropdownButton);

        // Note area
        const noteTextArea = utils.createElement('div', {
            className: 'note-textarea',
            contentEditable: 'true',
            placeholder: 'Write your note here...'
        });
        
        // Apply mobile-specific styles to textarea if on mobile
        if (isMobile) {
            noteTextArea.style.width = '100%';
            noteTextArea.style.maxWidth = '80%';
            noteTextArea.style.boxSizing = 'border-box';
            noteTextArea.style.overflowX = 'hidden';
            noteTextArea.style.margin = '0 auto';
        }
        
        // Add auto-resize functionality
        noteTextArea.addEventListener('input', utils.throttle(function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        }, 100));

        // Dropdown content
        const dropdownContent = utils.createElement('div', {
            className: 'dropdown-content',
            id: dropdownId,
            style: {
                display: 'none',
                position: 'absolute',
                zIndex: '1000',
                minWidth: '120px',
                maxWidth: '150px',
                width: 'auto'
            }
        });
        
        titleBar.appendChild(dropdownContent);

        // Create dropdown items
        const items = [
            { icon: 'save.png', alt: 'Save', text: 'Save', action: saveNote },
            { icon: 'trash.png', alt: 'Delete', text: 'Delete', action: deleteNote },
            { icon: 'imgAtch.png', alt: 'Add Image', text: 'Add Image', action: attachImage },
            { icon: 'trash.png', alt: 'Delete Image', text: 'Delete Image', action: deleteImage }
        ];

        items.forEach(item => {
            const button = utils.createElement('button', {
                className: 'dropdown-item'
            });
            
            // Create icon container
            const iconContainer = utils.createElement('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    marginRight: '8px'
                }
            });
            
            const icon = utils.createElement('img', {
                src: item.icon,
                alt: item.alt,
                style: {
                    width: '16px',
                    height: '16px',
                    position: 'static',
                    margin: '0'
                }
            });
            
            iconContainer.appendChild(icon);
            
            const textSpan = utils.createElement('span', {
                textContent: item.text,
                style: {
                    flex: '1'
                }
            });
            
            // Create content container for proper alignment
            const contentContainer = utils.createElement('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: '8px'
                }
            });
            
            contentContainer.appendChild(iconContainer);
            contentContainer.appendChild(textSpan);
            button.appendChild(contentContainer);
            
            button.addEventListener('click', () => {
                item.action(noteContainer, titleInput, noteTextArea);
                closeAllDropdowns();
            });
            
            dropdownContent.appendChild(button);
        });

        // Dropdown toggle
        dropdownButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownId = this.getAttribute('data-dropdown-id');
            const dropdownContent = document.getElementById(dropdownId);
            
            // Check if dropdown content exists
            if (!dropdownContent) {
                console.error('Dropdown content not found for ID:', dropdownId);
                return;
            }
            
            const isCurrentlyShown = dropdownContent.classList.contains('show');
            
            // Close all other dropdowns first
            closeAllDropdowns();
            
            if (!isCurrentlyShown) {
                // Position the dropdown content relative to the button
                const buttonRect = this.getBoundingClientRect();
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    // On mobile, position to the right of the button
                    dropdownContent.style.position = 'absolute';
                    dropdownContent.style.top = '0';
                    dropdownContent.style.right = '0';
                    dropdownContent.style.width = '120px';
                } else {
                    // On desktop, position below the button
                    dropdownContent.style.position = 'absolute';
                    dropdownContent.style.top = '100%';
                    dropdownContent.style.right = '0';
                    dropdownContent.style.width = '150px';
                }
                
                // Show the dropdown with proper visibility
                dropdownContent.style.opacity = '1';
                dropdownContent.style.visibility = 'visible';
                dropdownContent.style.display = 'block';
                dropdownContent.classList.add('show');
                dropdownIcon.src = 'dropDown2.png';
                dropdownIcon.alt = 'Close Menu';
            } else {
                dropdownContent.classList.remove('show');
                dropdownContent.style.display = 'none';
                dropdownContent.style.opacity = '0';
                dropdownContent.style.visibility = 'hidden';
                dropdownIcon.src = 'dropDown.png';
                dropdownIcon.alt = 'Menu';
            }
        });

        // Prevent closing when clicking inside dropdown
        dropdownContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Append elements
        noteContainer.appendChild(titleBar);
        noteContainer.appendChild(noteTextArea);
        DOM.noteContainers.appendChild(noteContainer);
        
        // Add animation for new note
        setTimeout(() => {
            noteContainer.style.opacity = '1';
            noteContainer.style.transform = 'translateY(0)';
        }, 10);
        
        STATE.noteCount++;
        
        // Update the background to cover the new content
        updateBackground();
        
        // Add image click handlers to the new note
        addImageClickHandlers();
        
        // Force update of responsive elements to ensure proper styling
        updateResponsiveElements();
    } else {
        alert('You have reached the maximum number of notes, save some notes first!');
    }
}

// Save note function
function saveNote(noteContainer, titleInput, noteTextArea) {
    const title = titleInput.value.trim();
    const noteText = noteTextArea.textContent.trim();
    
    // Check if the note is empty (no title and no content)
    if (!title && !noteText) {
        showNotification('Cannot save an empty note. Please add a title or content.', 'error', noteContainer);
        return;
    }
    
    // Get the image gallery container if it exists
    const imageGalleryContainer = noteContainer.querySelector('.image-gallery-container');
    let imageData = null;
    
    // If there's an image gallery, get the first image's data
    if (imageGalleryContainer && imageGalleryContainer.querySelector('img')) {
        const img = imageGalleryContainer.querySelector('img');
        imageData = img.src;
    }
    
    // Create note object
    const note = {
        title: title || 'Untitled Note', // Use 'Untitled Note' if title is empty
        note: noteText,
        image: imageData,
        timestamp: new Date().toISOString()
    };
    
    // Get existing notes from localStorage
    let savedNotes = JSON.parse(localStorage.getItem('savedNotes')) || [];
    
    // Add new note
    savedNotes.push(note);
    
    // Save to localStorage
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
    
    // Show success notification with more details
    const notificationMessage = title 
        ? `Note "${title}" saved successfully!` 
        : 'Untitled note saved successfully!';
    showNotification(notificationMessage, 'success', noteContainer);
    
    // Optional: Add a visual indicator that the note was saved
    const saveIndicator = document.createElement('div');
    saveIndicator.className = 'save-indicator';
    saveIndicator.textContent = '✓ Saved';
    saveIndicator.style.position = 'absolute';
    saveIndicator.style.top = '10px';
    saveIndicator.style.right = '10px';
    saveIndicator.style.color = 'green';
    saveIndicator.style.fontWeight = 'bold';
    saveIndicator.style.opacity = '0';
    saveIndicator.style.transition = 'opacity 0.3s ease-in-out';
    
    noteContainer.appendChild(saveIndicator);
    
    // Show the indicator
    setTimeout(() => {
        saveIndicator.style.opacity = '1';
    }, 10);
    
    // Hide the indicator after 2 seconds
    setTimeout(() => {
        saveIndicator.style.opacity = '0';
        setTimeout(() => {
            if (saveIndicator.parentNode) {
                saveIndicator.parentNode.removeChild(saveIndicator);
            }
        }, 300);
    }, 2000);
}

// Delete note function
function deleteNote(noteContainer) {
    // Get the dropdown ID before removing the note
    const dropdownButton = noteContainer.querySelector('.dropdown-button');
    const dropdownId = dropdownButton ? dropdownButton.getAttribute('data-dropdown-id') : null;
    
    // Remove the dropdown content from the title bar if it exists
    if (dropdownId) {
        const titleBar = noteContainer.querySelector('.title-bar');
        const dropdownContent = titleBar ? titleBar.querySelector(`#${dropdownId}`) : null;
        if (dropdownContent) {
            titleBar.removeChild(dropdownContent);
        }
    }
    
    // Remove the note container
    noteContainer.remove();
    STATE.noteCount--;
    
    // Update the background
    updateBackground();
    
    // If this is a saved note being edited, remove it from localStorage
    const noteToEdit = localStorage.getItem('noteToEdit');
    if (noteToEdit) {
        const { index } = JSON.parse(noteToEdit);
        const savedNotes = JSON.parse(localStorage.getItem('savedNotes')) || [];
        savedNotes.splice(index, 1);
        localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
        localStorage.removeItem('noteToEdit');
    }
}

// Attach image function
function attachImage(noteContainer, titleInput, noteTextArea) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            // Check if we're on a mobile device
            const isMobile = window.innerWidth <= 768;
            
            // Create the image element
            const img = utils.createElement('img', {
                src: e.target.result,
                width: isMobile ? '250' : '350',
                height: isMobile ? '250' : '350',
                style: 'object-fit: cover; display: block; margin: 0;'
            });

            // Add click handler for image focus
            img.addEventListener('click', function() {
                STATE.imageFocusElements.currentImage = this;
                
                // Set the focused image source
                STATE.imageFocusElements.focusedImg.src = this.src;
                
                // Show the overlay and focused image
                STATE.imageFocusElements.overlay.style.display = 'block';
                STATE.imageFocusElements.focusedContainer.style.display = 'block';
            });
            
            // Get or create the image gallery container
            let imageGalleryContainer = noteContainer.querySelector('.image-gallery-container');
            if (!imageGalleryContainer) {
                // Create the gallery container with scrollbar
                imageGalleryContainer = utils.createElement('div', {
                    className: 'image-gallery-container'
                });
                
                // Apply styles directly to ensure they're applied
                imageGalleryContainer.style.display = 'flex';
                imageGalleryContainer.style.flexDirection = 'row';
                imageGalleryContainer.style.flexWrap = 'nowrap';
                imageGalleryContainer.style.overflowX = 'auto';
                imageGalleryContainer.style.overflowY = 'hidden';
                imageGalleryContainer.style.width = '100%';
                imageGalleryContainer.style.maxWidth = '100%';
                imageGalleryContainer.style.padding = isMobile ? '10px' : '15px';
                imageGalleryContainer.style.margin = isMobile ? '10px 0' : '15px 0';
                imageGalleryContainer.style.boxSizing = 'border-box';
                
                // Enhanced scrollbar styling for mobile
                if (isMobile) {
                    // Make scrollbar more visible on mobile
                    imageGalleryContainer.style.scrollbarWidth = 'auto';
                    imageGalleryContainer.style.webkitOverflowScrolling = 'touch';
                    
                    // Add a subtle indicator that scrolling is possible
                    imageGalleryContainer.style.background = 'linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)';
                    imageGalleryContainer.style.backgroundSize = '20px 100%';
                    imageGalleryContainer.style.backgroundRepeat = 'no-repeat';
                    imageGalleryContainer.style.backgroundPosition = 'right center';
                    
                    // Add a scroll indicator text
                    const scrollIndicator = utils.createElement('div', {
                        className: 'scroll-indicator',
                        textContent: '← Scroll →',
                        style: 'position: absolute; right: 10px; top: 5px; font-size: 12px; color: #888; background: rgba(255,255,255,0.7); padding: 2px 8px; border-radius: 10px; pointer-events: none;'
                    });
                    imageGalleryContainer.appendChild(scrollIndicator);
                    
                    // Add scroll event listener to hide indicator when scrolled
                    imageGalleryContainer.addEventListener('scroll', function() {
                        if (this.scrollLeft > 10) {
                            scrollIndicator.style.opacity = '0';
                        } else {
                            scrollIndicator.style.opacity = '1';
                        }
                    });
                    
                    // Ensure the note container doesn't extend beyond viewport
                    noteContainer.style.width = '100%';
                    noteContainer.style.maxWidth = '100%';
                    noteContainer.style.overflow = 'hidden';
                    noteContainer.style.boxSizing = 'border-box';
                    
                    // Ensure the textarea doesn't extend beyond viewport
                    noteTextArea.style.width = '100%';
                    noteTextArea.style.maxWidth = '80%';
                    noteTextArea.style.boxSizing = 'border-box';
                    noteTextArea.style.overflowX = 'hidden';
                } else {
                    imageGalleryContainer.style.scrollbarWidth = 'thin';
                }
                
                // Add a placeholder text if no images
                const placeholder = utils.createElement('div', {
                    className: 'image-gallery-placeholder',
                    textContent: 'Images will appear here',
                    style: 'color: #888; font-style: italic; margin: auto;'
                });
                imageGalleryContainer.appendChild(placeholder);
                
                // Insert the gallery container at the beginning of the note
                noteTextArea.parentNode.insertBefore(imageGalleryContainer, noteTextArea);
            }
            
            // Remove placeholder if it exists
            const placeholder = imageGalleryContainer.querySelector('.image-gallery-placeholder');
            if (placeholder) {
                imageGalleryContainer.removeChild(placeholder);
            }
            
            // Create a wrapper div for the image with controls
            const imageWrapper = utils.createElement('div', {
                className: 'image-wrapper'
            });
            
            // Apply styles directly to ensure they're applied
            imageWrapper.style.position = 'relative';
            imageWrapper.style.flex = '0 0 auto';
            imageWrapper.style.flexShrink = '0';
            imageWrapper.style.width = isMobile ? '250px' : '350px';
            imageWrapper.style.height = isMobile ? '250px' : '350px';
            imageWrapper.style.overflow = 'hidden';
            imageWrapper.style.borderRadius = '8px';
            imageWrapper.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            imageWrapper.style.marginRight = '40px';
            
            // Add the image to the wrapper
            imageWrapper.appendChild(img);
            
            // Create image controls container
            const imageControls = utils.createElement('div', {
                className: 'image-controls'
            });
            
            // Apply styles directly to ensure they're applied
            imageControls.style.position = 'absolute';
            imageControls.style.bottom = '10px';
            imageControls.style.right = '10px';
            imageControls.style.display = 'flex';
            imageControls.style.gap = '5px';
            imageControls.style.opacity = '0';
            imageControls.style.transition = 'opacity 0.3s ease';
            
            // Add zoom button
            const zoomBtn = utils.createElement('button', {
                className: 'image-zoom-btn',
                textContent: '🔍'
            });
            
            // Apply styles directly to ensure they're applied
            zoomBtn.style.background = 'rgba(0,0,0,0.6)';
            zoomBtn.style.color = 'white';
            zoomBtn.style.border = 'none';
            zoomBtn.style.borderRadius = '4px';
            zoomBtn.style.padding = '5px 10px';
            zoomBtn.style.cursor = 'pointer';
            
            // Add delete button
            const deleteBtn = utils.createElement('button', {
                className: 'image-delete-btn',
                textContent: '🗑️'
            });
            
            // Apply styles directly to ensure they're applied
            deleteBtn.style.background = 'rgba(255,0,0,0.6)';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.borderRadius = '4px';
            deleteBtn.style.padding = '5px 10px';
            deleteBtn.style.cursor = 'pointer';
            
            // Add event listeners for the buttons
            zoomBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Set the focused image source
                STATE.imageFocusElements.focusedImg.src = img.src;
                
                // Show the overlay and focused image
                STATE.imageFocusElements.overlay.style.display = 'block';
                STATE.imageFocusElements.focusedContainer.style.display = 'block';
                
                // Store reference to the clicked image
                STATE.imageFocusElements.currentImage = img;
            });
            
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Remove the image wrapper from the gallery
                imageGalleryContainer.removeChild(imageWrapper);
                
                // If no images left, add the placeholder back
                if (imageGalleryContainer.children.length === 0) {
                    const newPlaceholder = utils.createElement('div', {
                        className: 'image-gallery-placeholder',
                        textContent: 'Images will appear here',
                        style: 'color: #888; font-style: italic; margin: auto;'
                    });
                    imageGalleryContainer.appendChild(newPlaceholder);
                }
            });
            
            // Add hover effect to show controls
            imageWrapper.addEventListener('mouseenter', function() {
                imageControls.style.opacity = '1';
            });
            
            imageWrapper.addEventListener('mouseleave', function() {
                imageControls.style.opacity = '0';
            });
            
            // Add the buttons to the controls container
            imageControls.appendChild(zoomBtn);
            imageControls.appendChild(deleteBtn);
            
            // Add the controls to the image wrapper
            imageWrapper.appendChild(imageControls);
            
            // Add the image wrapper to the gallery container
            imageGalleryContainer.appendChild(imageWrapper);
            
            // Focus back on the textarea
            noteTextArea.focus();
            
            // Add image click handlers
            addImageClickHandlers();
            
            // Force update of responsive elements to ensure proper width constraints
            updateResponsiveElements();
        };
        reader.readAsDataURL(file);
    });
}

// Function to delete an image
function deleteImage(noteContainer, titleInput, noteTextArea) {
    // Check if there's a focused image
    if (STATE.imageFocusElements && STATE.imageFocusElements.currentImage) {
        const imageToDelete = STATE.imageFocusElements.currentImage;
        
        // Remove the image from the DOM
        if (imageToDelete.parentNode) {
            imageToDelete.parentNode.removeChild(imageToDelete);
            
            // Check if the grid container is now empty and remove it if needed
            const imageGridContainer = noteTextArea.querySelector('.image-grid-container');
            if (imageGridContainer && imageGridContainer.children.length === 0) {
                imageGridContainer.remove();
            }
        }
        
        // Close the focused image view
        closeFocusedImage();
        
        // Show a confirmation message
        const notification = utils.createElement('div', {
            className: 'notification',
            textContent: 'Image deleted successfully',
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                zIndex: '10001',
                animation: 'fadeInOut 3s forwards'
            }
        });
        
        document.body.appendChild(notification);
        
        // Remove the notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    } else {
        // If no image is focused, show a message
        alert('Please click on an image to delete it');
    }
}

// Define updateBackground in global scope
function updateBackground() {
    // Apply fixed background
    const bgElement = document.querySelector('.bgImage');
    if (bgElement) {
        // Check if we're on a mobile device
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // On mobile, use absolute positioning and adjust height
            bgElement.style.position = 'absolute';
            bgElement.style.height = 'auto';
            bgElement.style.minHeight = '100%';
            
            // Calculate the full document height
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            
            // Set the height to match the document height
            bgElement.style.height = `${documentHeight}px`;
        } else {
            // On desktop, use fixed positioning
            bgElement.style.position = 'fixed';
            bgElement.style.height = '100%';
            bgElement.style.backgroundPosition = 'center center';
        }
    }
}

// Function to change font size
function changeFontSize(direction) {
    if (direction === 'increase' && STATE.currentFontSize < CONFIG.FONT.MAX_SIZE) {
        STATE.currentFontSize += CONFIG.FONT.STEP;
    } else if (direction === 'decrease' && STATE.currentFontSize > CONFIG.FONT.MIN_SIZE) {
        STATE.currentFontSize -= CONFIG.FONT.STEP;
    }
    
    // Apply font size to all note containers
    const noteContainers = document.querySelectorAll('.note-container');
    noteContainers.forEach(container => {
        const titleInput = container.querySelector('.title-input');
        const noteTextArea = container.querySelector('.note-textarea');
        
        if (titleInput) {
            titleInput.style.fontSize = `${STATE.currentFontSize}px`;
        }
        
        if (noteTextArea) {
            noteTextArea.style.fontSize = `${STATE.currentFontSize}px`;
        }
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
        changeFontSize(''); // Apply the saved font size
    }
}

// Function to update the font size display
function updateFontSizeDisplay() {
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    if (fontSizeDisplay) {
        fontSizeDisplay.textContent = `${STATE.currentFontSize}px`;
    }
}

// Initialize font size controls
function initializeFontControls() {
    // Initialize font size from localStorage
    initializeFontSize();
    
    // Add event listeners to font size buttons
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => changeFontSize('decrease'));
    }
    
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => changeFontSize('increase'));
    }
    
    // Update the font size display
    updateFontSizeDisplay();
}

// Update the updateResponsiveElements function to center containers on mobile
function updateResponsiveElements() {
    const isMobile = window.innerWidth <= 768;
    const imageGalleries = document.querySelectorAll('.image-gallery-container');
    const noteContainers = document.querySelectorAll('.note-container');
    
    // Update image galleries
    imageGalleries.forEach(gallery => {
        // Fix for mobile overflow issues
        if (isMobile) {
            // Reset all styles first
            gallery.style = '';
            
            // Apply mobile-specific styles with strict width constraints
            gallery.style.display = 'flex';
            gallery.style.flexDirection = 'row';
            gallery.style.flexWrap = 'nowrap';
            gallery.style.overflowX = 'auto';
            gallery.style.overflowY = 'hidden';
            gallery.style.width = '100%';
            gallery.style.maxWidth = '100vw';
            gallery.style.padding = '10px';
            gallery.style.margin = '10px auto'; // Center the gallery
            gallery.style.boxSizing = 'border-box';
            
            // Enhanced scrollbar styling for mobile
            gallery.style.scrollbarWidth = 'auto';
            gallery.style.webkitOverflowScrolling = 'touch';
            
            // Add a subtle indicator that scrolling is possible
            gallery.style.background = 'linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)';
            gallery.style.backgroundSize = '20px 100%';
            gallery.style.backgroundRepeat = 'no-repeat';
            gallery.style.backgroundPosition = 'right center';
            
            // Check if scroll indicator exists, if not add it
            if (!gallery.querySelector('.scroll-indicator')) {
                const scrollIndicator = utils.createElement('div', {
                    className: 'scroll-indicator',
                    textContent: '← Scroll →',
                    style: 'position: absolute; right: 10px; top: 5px; font-size: 12px; color: #888; background: rgba(255,255,255,0.7); padding: 2px 8px; border-radius: 10px; pointer-events: none;'
                });
                gallery.appendChild(scrollIndicator);
                
                // Add scroll event listener to hide indicator when scrolled
                gallery.addEventListener('scroll', function() {
                    if (this.scrollLeft > 10) {
                        scrollIndicator.style.opacity = '0';
                    } else {
                        scrollIndicator.style.opacity = '1';
                    }
                });
            }
            
            // Force the gallery to stay within its parent container
            const parent = gallery.parentElement;
            if (parent) {
                parent.style.overflow = 'hidden';
                parent.style.width = '100%';
                parent.style.maxWidth = '100vw';
                parent.style.boxSizing = 'border-box';
                
                // Ensure the parent container doesn't extend beyond viewport
                const noteContainer = parent.closest('.note-container');
                if (noteContainer) {
                    noteContainer.style.width = '100%';
                    noteContainer.style.maxWidth = '100vw';
                    noteContainer.style.overflow = 'hidden';
                    noteContainer.style.boxSizing = 'border-box';
                    
                    // Force the note container to stay within viewport
                    const noteContainersParent = noteContainer.parentElement;
                    if (noteContainersParent) {
                        noteContainersParent.style.width = '100%';
                        noteContainersParent.style.maxWidth = '100vw';
                        noteContainersParent.style.overflow = 'hidden';
                        noteContainersParent.style.boxSizing = 'border-box';
                    }
                }
            }
        } else {
            // Reset all styles first
            gallery.style = '';
            
            // Apply desktop-specific styles
            gallery.style.display = 'flex';
            gallery.style.flexDirection = 'row';
            gallery.style.flexWrap = 'nowrap';
            gallery.style.overflowX = 'auto';
            gallery.style.overflowY = 'hidden';
            gallery.style.width = '100%';
            gallery.style.maxWidth = '100%';
            gallery.style.padding = '15px';
            gallery.style.margin = '15px 0';
            gallery.style.boxSizing = 'border-box';
            gallery.style.scrollbarWidth = 'thin';
            
            // Remove scroll indicator if it exists
            const scrollIndicator = gallery.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                gallery.removeChild(scrollIndicator);
            }
        }
        
        const imageWrappers = gallery.querySelectorAll('div[style*="position: relative"]');
        
        imageWrappers.forEach(wrapper => {
            // Reset all styles first
            wrapper.style = '';
            
            // Apply base styles
            wrapper.style.position = 'relative';
            wrapper.style.flex = '0 0 auto';
            wrapper.style.flexShrink = '0';
            wrapper.style.width = isMobile ? '250px' : '350px';
            wrapper.style.height = isMobile ? '250px' : '350px';
            wrapper.style.overflow = 'hidden';
            wrapper.style.borderRadius = '8px';
            wrapper.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            wrapper.style.marginRight = isMobile ? '40px' : '15px';
            
            // Update image dimensions
            const img = wrapper.querySelector('img');
            if (img) {
                // Reset all styles first
                img.style = '';
                
                // Apply image styles
                img.style.width = isMobile ? '250px' : '350px';
                img.style.height = isMobile ? '250px' : '350px';
                img.style.objectFit = 'cover';
                img.style.display = 'block';
                img.style.margin = '0';
            }
        });
    });
    
    // Update note containers
    noteContainers.forEach(container => {
        if (isMobile) {
            // Reset all styles first
            container.style = '';
            
            // Apply mobile-specific styles with strict width constraints
            container.style.position = 'relative';
            container.style.background = 'var(--note-bg)';
            container.style.borderRadius = '12px';
            container.style.padding = '1.2rem';
            container.style.boxShadow = '0 6px 12px var(--note-shadow)';
            container.style.minHeight = '150px';
            container.style.width = '90%'; // Reduced width for better mobile display
            container.style.maxWidth = '100vw';
            container.style.minWidth = '90%';
            container.style.margin = '1rem auto'; // Center the container
            container.style.resize = 'none';
            container.style.overflow = 'hidden'; // Changed from 'auto' to 'hidden'
            container.style.boxSizing = 'border-box';
            container.style.border = '1px solid var(--note-border)';
            container.style.display = 'block'; // Ensure block display for centering
            
            // Ensure the note container doesn't extend beyond viewport
            const noteTextArea = container.querySelector('.note-textarea');
            if (noteTextArea) {
                noteTextArea.style.width = '100%';
                noteTextArea.style.maxWidth = '80%';
                noteTextArea.style.boxSizing = 'border-box';
                noteTextArea.style.overflowX = 'hidden';
                noteTextArea.style.margin = '0 auto'; // Center the textarea
            }
            
            // Force the note container to stay within viewport
            const noteContainersParent = container.parentElement;
            if (noteContainersParent) {
                noteContainersParent.style.width = '100%';
                noteContainersParent.style.maxWidth = '100vw';
                noteContainersParent.style.overflow = 'hidden';
                noteContainersParent.style.boxSizing = 'border-box';
                noteContainersParent.style.display = 'flex';
                noteContainersParent.style.flexDirection = 'column';
                noteContainersParent.style.alignItems = 'center'; // Center children horizontally
            }
        } else {
            // Reset all styles first
            container.style = '';
            
            // Apply desktop-specific styles
            container.style.position = 'relative';
            container.style.background = 'var(--note-bg)';
            container.style.borderRadius = '12px';
            container.style.padding = '1.2rem';
            container.style.boxShadow = '0 6px 12px var(--note-shadow)';
            container.style.minHeight = '150px';
            container.style.width = 'calc(25% - 1.125rem)';
            container.style.minWidth = '220px';
            container.style.maxWidth = '600px';
            container.style.margin = '0';
            container.style.resize = 'both';
            container.style.overflow = 'auto';
            container.style.boxSizing = 'border-box';
            container.style.border = '1px solid var(--note-border)';
        }
    });
    
    // Force the body and html elements to have proper width constraints
    if (isMobile) {
        document.body.style.overflowX = 'hidden';
        document.body.style.width = '100%';
        document.body.style.boxSizing = 'border-box';
        
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.width = '100%';
        document.documentElement.style.boxSizing = 'border-box';
    }
}

// Update the addMobileViewportFix function to center containers
function addMobileViewportFix() {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            body, html {
                overflow-x: hidden !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            
            .note-containers {
                width: 100% !important;
                max-width: 100vw !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                 margin-right: 10ch !important;
            }
            
            .note-container {
                width: 90% !important;
                max-width: 100vw !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
                margin: 1rem auto !important;
                display: block !important;
                 margin-right: 4ch !important;
            }
            
            .note-textarea {
                width: 100% !important;
                max-width: 80% !important;
                overflow-x: hidden !important;
                box-sizing: border-box !important;
                margin: 0 auto !important;
            }
            
            .image-gallery-container {
                width: 100% !important;
                max-width: 70vw !important;
                overflow-x: auto !important;
                overflow-y: hidden !important;
                box-sizing: border-box !important;
                margin: 10px auto !important;
            }
        }
    `;
    
    // Append the style element to the head
    document.head.appendChild(style);
}

// Call the addMobileViewportFix function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a note to edit
    const noteToEdit = localStorage.getItem('noteToEdit');
    if (noteToEdit) {
        const { index, note } = JSON.parse(noteToEdit);
        
        // Create a new note with the saved content
        createNote();
        
        // Get the newly created note container
        const noteContainers = document.querySelectorAll('.note-container');
        const newNoteContainer = noteContainers[noteContainers.length - 1];
        
        // Set the title and content
        const titleInput = newNoteContainer.querySelector('.title-input');
        const noteTextArea = newNoteContainer.querySelector('.note-textarea');
        
        titleInput.value = note.title;
        noteTextArea.textContent = note.note;
        
        // If there's an image, add it
        if (note.image) {
            // Create image gallery container
            const imageGalleryContainer = document.createElement('div');
            imageGalleryContainer.className = 'image-gallery-container';
            
            // Create the image element
            const img = document.createElement('img');
            img.src = note.image;
            img.alt = 'Attached image';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '10px 0';
            
            // Add click handler for image focus
            img.addEventListener('click', function() {
                STATE.imageFocusElements.currentImage = this;
                
                // Set the focused image source
                STATE.imageFocusElements.focusedImg.src = this.src;
                
                // Show the overlay and focused image
                STATE.imageFocusElements.overlay.style.display = 'block';
                STATE.imageFocusElements.focusedContainer.style.display = 'block';
            });
            
            // Add the image to the gallery container
            imageGalleryContainer.appendChild(img);
            
            // Insert the gallery container before the noteTextArea
            noteTextArea.parentNode.insertBefore(imageGalleryContainer, noteTextArea);
        }
        
        // Clear the noteToEdit from localStorage
        localStorage.removeItem('noteToEdit');
        
        // Remove the note from saved notes
        const notes = JSON.parse(localStorage.getItem('savedNotes')) || [];
        notes.splice(index, 1);
        localStorage.setItem('savedNotes', JSON.stringify(notes));
    }
    
    // Initialize image focus elements
    STATE.imageFocusElements = createImageFocusElements();
    
    // Add click handlers to existing images
    addImageClickHandlers();
    
    // Initialize font controls
    initializeFontControls();
    
    // Add event listeners for scroll events
    window.addEventListener('scroll', utils.throttle(function() {
        if (!STATE.ticking) {
            window.requestAnimationFrame(function() {
                updateBackground();
            });
            STATE.ticking = true;
        }
    }, 100));

    // Initial call to set background position
    updateBackground();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-button') && !e.target.closest('.dropdown-content')) {
            closeAllDropdowns();
        }
    });
    
    // Initialize responsive elements
    updateResponsiveElements();
    
    // Add mobile viewport fix
    addMobileViewportFix();
});

function displaySavedNotes() {
    const savedNotesContainer = document.getElementById('savedNotesList');
    savedNotesContainer.innerHTML = '';
    
    const savedNotes = JSON.parse(localStorage.getItem('savedNotes')) || [];
    
    if (savedNotes.length === 0) {
        savedNotesContainer.innerHTML = '<p class="no-notes">No saved notes yet.</p>';
        return;
    }
    
    savedNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'saved-note';
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = note.title;
        
        const contentElement = document.createElement('p');
        contentElement.textContent = note.note;
        
        const timestampElement = document.createElement('small');
        timestampElement.textContent = new Date(note.timestamp).toLocaleString();
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-note';
        deleteButton.innerHTML = '&times;';
        deleteButton.onclick = () => deleteSavedNote(index);
        
        noteElement.appendChild(titleElement);
        noteElement.appendChild(contentElement);
        
        // Add image if it exists
        if (note.image) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-gallery-container';
            
            const img = document.createElement('img');
            img.src = note.image;
            img.alt = 'Note image';
            img.className = 'note-image';
            
            // Add click handler for image focus
            img.onclick = function() {
                const overlay = document.createElement('div');
                overlay.className = 'image-overlay';
                
                const focusedImg = document.createElement('img');
                focusedImg.src = this.src;
                focusedImg.className = 'focused-image';
                
                overlay.appendChild(focusedImg);
                document.body.appendChild(overlay);
                
                overlay.onclick = function() {
                    document.body.removeChild(overlay);
                };
            };
            
            imageContainer.appendChild(img);
            noteElement.appendChild(imageContainer);
        }
        
        noteElement.appendChild(timestampElement);
        noteElement.appendChild(deleteButton);
        
        savedNotesContainer.appendChild(noteElement);
    });
}

// Function to delete a saved note by index
function deleteSavedNote(index) {
    // Get saved notes from localStorage
    const savedNotes = JSON.parse(localStorage.getItem('savedNotes')) || [];
    
    // Remove the note at the specified index
    savedNotes.splice(index, 1);
    
    // Save the updated notes back to localStorage
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
    
    // Show notification
    showNotification('Note deleted successfully!', 'success');
    
    // Check which page we're on and call the appropriate function to refresh the display
    const savedNotesList = document.getElementById('savedNotesList');
    if (savedNotesList) {
        // We're on the saved notes page, call loadSavedNotes if it exists
        if (typeof loadSavedNotes === 'function') {
            loadSavedNotes();
        } else {
            // Fallback to our displaySavedNotes function
            displaySavedNotes();
        }
    } else {
        // We're on another page, just refresh our display
        displaySavedNotes();
    }
}

// Function to show notifications
function showNotification(message, type = 'info', noteContainer = null) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'absolute';
    notification.style.padding = '8px 12px';
    notification.style.borderRadius = '5px';
    notification.style.color = 'white';
    notification.style.zIndex = '9999';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    notification.style.maxWidth = '200px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.fontSize = '14px';
    notification.style.textAlign = 'center';
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
    } else if (type === 'error') {
        notification.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
    } else {
        notification.style.backgroundColor = 'rgba(0, 123, 255, 0.9)';
    }
    
    // If a note container is provided, position the notification beside it
    if (noteContainer) {
        // Position the notification to the right of the note container
        const noteRect = noteContainer.getBoundingClientRect();
        notification.style.top = `${noteRect.top + window.scrollY}px`;
        notification.style.left = `${noteRect.right + 10}px`;
        
        // Add to document
        document.body.appendChild(notification);
    } else {
        // Fallback to fixed position at bottom right if no note container
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        
        // Add to document
        document.body.appendChild(notification);
    }
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}