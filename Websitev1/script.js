const noteContainers = document.querySelector('.note-containers');
const createNoteButton = document.querySelector('.btn');
let noteCount = 0;

// Function to close all dropdowns
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    const dropdownIcons = document.querySelectorAll('.dropdown-button img');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
    });
    dropdownIcons.forEach(icon => icon.src = 'dropDown.png');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-button') && !e.target.closest('.dropdown-content')) {
        closeAllDropdowns();
    }
});

function createNote() {
    if(noteCount < 12) {
        const noteContainer = document.createElement('div');
        noteContainer.className = 'note-container';

        // Title area
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.placeholder = 'Title';
        titleInput.className = 'title-input';

        // Note area
        const noteTextArea = document.createElement('div');
        noteTextArea.className = 'note-textarea';
        noteTextArea.contentEditable = 'true';
        noteTextArea.setAttribute('placeholder', 'Write your note here...');
        
        // Add auto-resize functionality
        noteTextArea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // Dropdown button
        const dropdownButton = document.createElement('button');
        dropdownButton.className = 'dropdown-button';
        const dropdownIcon = document.createElement('img');
        dropdownIcon.src = 'dropDown.png';
        dropdownIcon.alt = 'Menu';
        dropdownButton.appendChild(dropdownIcon);

        // Dropdown content
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'dropdown-content';
        dropdownContent.style.display = 'none';

        // Create dropdown items
        const items = [
            { icon: 'save.png', alt: 'Save', text: 'Save', action: saveNote },
            { icon: 'trash.png', alt: 'Delete', text: 'Delete', action: deleteNote },
            { icon: 'imgAtch.png', alt: 'Add Image', text: 'Add Image', action: attachImage }
        ];

        items.forEach(item => {
            const button = document.createElement('button');
            button.className = 'dropdown-item';
            const icon = document.createElement('img');
            icon.src = item.icon;
            icon.alt = item.alt;
            button.appendChild(icon);
            
            // Add text span after the icon
            const textSpan = document.createElement('span');
            textSpan.textContent = item.text;
            button.appendChild(textSpan);
            
            button.addEventListener('click', () => {
                item.action(noteContainer, titleInput, noteTextArea);
                closeAllDropdowns();
            });
            dropdownContent.appendChild(button);
        });

        // Dropdown toggle
        dropdownButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const isCurrentlyShown = dropdownContent.classList.contains('show');
            
            // Close all other dropdowns first
            closeAllDropdowns();
            
            if (!isCurrentlyShown) {
                // Position the dropdown content relative to the button
                const buttonRect = dropdownButton.getBoundingClientRect();
                dropdownContent.style.position = 'fixed';
                dropdownContent.style.top = `${buttonRect.bottom + 5}px`;
                dropdownContent.style.left = `${buttonRect.left}px`;
                
                dropdownContent.classList.add('show');
                dropdownContent.style.display = 'block';
                dropdownIcon.src = 'dropDown2.png';
                
                // Append to body if not already there
                if (!document.body.contains(dropdownContent)) {
                    document.body.appendChild(dropdownContent);
                }
            } else {
                dropdownContent.classList.remove('show');
                dropdownContent.style.display = 'none';
                dropdownIcon.src = 'dropDown.png';
            }
        });

        // Prevent closing when clicking inside dropdown
        dropdownContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Append elements
        noteContainer.appendChild(titleInput);
        noteContainer.appendChild(noteTextArea);
        noteContainer.appendChild(dropdownButton);
        // Note: dropdownContent is now appended to body when needed
        noteContainers.appendChild(noteContainer);
        
        // Add animation for new note
        setTimeout(() => {
            noteContainer.style.opacity = '1';
            noteContainer.style.transform = 'translateY(0)';
        }, 10);
        
        noteCount++;
        
        // Update the background to cover the new content
        updateBackground();
    }
    else{
        alert('You have reached the maximum number of notes, save some notes first!');
    }
}

// Save note function
function saveNote(noteContainer, titleInput, noteTextArea) {
    const title = titleInput.value;
    const note = noteTextArea.innerText;
    const image = noteTextArea.querySelector('img');

    if (!title || !note) {
        alert('Please enter a title and some text.');
        return;
    }

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteData = { title, note };

    if (image) {
        noteData.image = image.src;
    }

    notes.push(noteData);
    localStorage.setItem('notes', JSON.stringify(notes));
    alert('Note saved successfully!');
}

// Delete note function
function deleteNote(noteContainer) {
    noteContainer.remove();
    noteCount--;
}

// Attach image function
function attachImage(noteContainer, titleInput, noteTextArea) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            noteTextArea.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    fileInput.click();
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get all elements with the scroll-reveal class
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    
    // Function to check if an element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Function to handle scroll events
    function handleScroll() {
        scrollElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('visible');
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check for elements already in viewport
    handleScroll();
    
    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add drag and drop functionality for note containers
    if (noteContainers) {
        let draggedItem = null;
        
        // Add event listeners for drag and drop
        noteContainers.addEventListener('dragstart', function(e) {
            if (e.target.classList.contains('note-container')) {
                draggedItem = e.target;
                setTimeout(() => {
                    e.target.style.opacity = '0.5';
                }, 0);
            }
        });
        
        noteContainers.addEventListener('dragend', function(e) {
            if (e.target.classList.contains('note-container')) {
                setTimeout(() => {
                    e.target.style.opacity = '1';
                }, 0);
                draggedItem = null;
            }
        });
        
        noteContainers.addEventListener('dragover', function(e) {
            e.preventDefault();
            const noteContainer = e.target.closest('.note-container');
            if (noteContainer && noteContainer !== draggedItem) {
                const rect = noteContainer.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    noteContainer.style.borderTop = '2px solid #40499b';
                    noteContainer.style.borderBottom = '';
                } else {
                    noteContainer.style.borderBottom = '2px solid #40499b';
                    noteContainer.style.borderTop = '';
                }
            }
        });
        
        noteContainers.addEventListener('dragleave', function(e) {
            const noteContainer = e.target.closest('.note-container');
            if (noteContainer) {
                noteContainer.style.borderTop = '';
                noteContainer.style.borderBottom = '';
            }
        });
        
        noteContainers.addEventListener('drop', function(e) {
            e.preventDefault();
            const noteContainer = e.target.closest('.note-container');
            
            if (noteContainer && draggedItem && noteContainer !== draggedItem) {
                const rect = noteContainer.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    noteContainers.insertBefore(draggedItem, noteContainer);
                } else {
                    noteContainers.insertBefore(draggedItem, noteContainer.nextSibling);
                }
                
                noteContainer.style.borderTop = '';
                noteContainer.style.borderBottom = '';
            }
        });
        
        // Make note containers draggable
        function makeNoteContainersDraggable() {
            const containers = document.querySelectorAll('.note-container');
            containers.forEach(container => {
                container.setAttribute('draggable', 'true');
            });
        }
        
        // Call initially and after creating new notes
        makeNoteContainersDraggable();
        
        // Override the createNoteButton click handler to make new notes draggable
        const originalCreateNoteButton = createNoteButton;
        createNoteButton.addEventListener = function(type, listener) {
            if (type === 'click') {
                return originalCreateNoteButton.addEventListener(type, function(e) {
                    listener.call(this, e);
                    makeNoteContainersDraggable();
                });
            } else {
                return originalCreateNoteButton.addEventListener(type, listener);
            }
        };
    }


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
        
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateBackground();
            });
            ticking = true;
        }
    });

    // Initial call to set background position
    updateBackground();
});