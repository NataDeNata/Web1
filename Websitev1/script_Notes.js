document.addEventListener('DOMContentLoaded', function () {
    const savedNotesList = document.getElementById('savedNotesList');
    savedNotesList.innerHTML = '';

    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    if (notes.length === 0) {
        savedNotesList.innerHTML = '<div class="no-notes">No saved notes found.</div>';
        return;
    }

    // Create zoom overlay/modal (only once per page)
    let zoomOverlay = document.getElementById('image-zoom-overlay');
    if (!zoomOverlay) {
        zoomOverlay = document.createElement('div');
        zoomOverlay.id = 'image-zoom-overlay';
        zoomOverlay.style.position = 'fixed';
        zoomOverlay.style.top = '0';
        zoomOverlay.style.left = '0';
        zoomOverlay.style.width = '100vw';
        zoomOverlay.style.height = '100vh';
        zoomOverlay.style.background = 'rgba(0,0,0,0.9)';
        zoomOverlay.style.display = 'none';
        zoomOverlay.style.justifyContent = 'center';
        zoomOverlay.style.alignItems = 'center';
        zoomOverlay.style.zIndex = '99999';
        zoomOverlay.innerHTML = `
          <span id="zoom-close-btn" style="position:absolute;top:24px;right:32px;font-size:40px;color:#fff;cursor:pointer;z-index:100000;">&times;</span>
          <img id="zoomed-image" src="" style="max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 4px 32px #000;display:block;margin:auto;">
        `;
        document.body.appendChild(zoomOverlay);
        // Close on click outside image or on close button
        zoomOverlay.addEventListener('click', function(e) {
            if (e.target === zoomOverlay || e.target.id === 'zoom-close-btn') {
                zoomOverlay.style.display = 'none';
                document.getElementById('zoomed-image').src = '';
            }
        });
    }

    notes.forEach((note, index) => {
        // Note container
        const noteContainer = document.createElement('div');
        noteContainer.className = 'note-container';
        noteContainer.dataset.noteIndex = index;

        // Title bar with dropdown
        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';
        titleBar.style.display = 'flex';
        titleBar.style.justifyContent = 'space-between';
        titleBar.style.alignItems = 'center';
        titleBar.style.padding = '0.5rem 1rem';

        // Title
        const titleDisplay = document.createElement('div');
        titleDisplay.className = 'saved-note-title-display';
        titleDisplay.textContent = note.title || '';
        titleDisplay.style.flex = '1';
        titleDisplay.style.marginRight = '1rem';

        // Dropdown button
        const dropdownButton = document.createElement('button');
        dropdownButton.className = 'dropdown-button';
        dropdownButton.style.background = 'none';
        dropdownButton.style.border = 'none';
        dropdownButton.style.padding = '0.5rem';
        dropdownButton.style.cursor = 'pointer';
        dropdownButton.style.display = 'flex';
        dropdownButton.style.alignItems = 'center';
        dropdownButton.style.justifyContent = 'center';

        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

        const dropdownIcon = document.createElement('img');
        dropdownIcon.src = currentTheme === 'dark' ? 'downAlt.png' : 'dropDown2.png';
        dropdownIcon.alt = 'Dropdown';
        dropdownIcon.style.width = '20px';
        dropdownIcon.style.height = '20px';
        dropdownButton.appendChild(dropdownIcon);

        // Dropdown content
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'dropdown-content';
        dropdownContent.style.display = 'none'; // Initially hidden

        // Edit button
        const editButton = document.createElement('button');
        editButton.className = 'dropdown-item';
        const editIcon = document.createElement('img');
        editIcon.src = currentTheme === 'dark' ? 'pencilAlt.png' : 'pencil.png';
        editIcon.alt = 'Edit';
        editButton.appendChild(editIcon);
        const editText = document.createElement('span');
        editText.textContent = 'Edit';
        editButton.appendChild(editText);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'dropdown-item';
        const deleteIcon = document.createElement('img');
        deleteIcon.src = currentTheme === 'dark' ? 'trashAlt.png' : 'trash.png';
        deleteIcon.alt = 'Delete';
        deleteButton.appendChild(deleteIcon);
        const deleteText = document.createElement('span');
        deleteText.textContent = 'Delete';
        deleteButton.appendChild(deleteText);

        // Add Image button
        const addImageButton = document.createElement('button');
        addImageButton.className = 'dropdown-item';
        const addImageIcon = document.createElement('img');
        addImageIcon.src = currentTheme === 'dark' ? 'imgAtchAlt.png' : 'imgAtch.png';
        addImageIcon.alt = 'Add Image';
        addImageButton.appendChild(addImageIcon);
        const addImageText = document.createElement('span');
        addImageText.textContent = 'Add Image';
        addImageButton.appendChild(addImageText);
        addImageButton.setAttribute('data-tooltip', 'Add image to note');

        // Add image functionality
        addImageButton.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            document.body.appendChild(input);

            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (!note.images) {
                            note.images = [];
                        }
                        note.images.push(event.target.result);
                        localStorage.setItem('notes', JSON.stringify(notes));
                        location.reload();
                    };
                    reader.readAsDataURL(file);
                }
            });

            input.click();
            document.body.removeChild(input);
        });

        // Add buttons to dropdown
        dropdownContent.appendChild(editButton);
        dropdownContent.appendChild(deleteButton);
        dropdownContent.insertBefore(addImageButton, deleteButton);

        // Add tooltips
        dropdownButton.setAttribute('data-tooltip', 'More options');
        editButton.setAttribute('data-tooltip', 'Edit note');
        deleteButton.setAttribute('data-tooltip', 'Delete note');

        // Add dropdown elements to title bar
        titleBar.appendChild(titleDisplay);
        titleBar.appendChild(dropdownButton);
        titleBar.appendChild(dropdownContent);

        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme');
                    // Update dropdown icon
                    dropdownIcon.src = newTheme === 'dark' ? 'downAlt.png' : 'dropDown2.png';
                    // Update other icons
                    editIcon.src = newTheme === 'dark' ? 'editAlt.png' : 'edit.png';
                    deleteIcon.src = newTheme === 'dark' ? 'trashAlt.png' : 'trash.png';
                    addImageIcon.src = newTheme === 'dark' ? 'imgAtchAlt.png' : 'imgAtch.png';
                }
            });
        });

        // Start observing theme changes
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Dropdown functionality
        dropdownButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = dropdownContent.style.display === 'block';
            dropdownContent.style.display = isVisible ? 'none' : 'block';
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            dropdownIcon.src = currentTheme === 'dark' ? 'downAlt.png' : 'dropDown2.png';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdownContent.contains(e.target) && !dropdownButton.contains(e.target)) {
                dropdownContent.style.display = 'none';
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                dropdownIcon.src = currentTheme === 'dark' ? 'downAlt.png' : 'dropDown2.png';
            }
        });

        // Image gallery
        const imageGallery = document.createElement('div');
        imageGallery.className = 'image-gallery-container';
        if (Array.isArray(note.images)) {
            note.images.forEach((src, imgIndex) => {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-wrapper';
                imgWrapper.style.position = 'relative';
                imgWrapper.style.display = 'inline-block';
                imgWrapper.style.margin = '0 8px 8px 0';

                const img = document.createElement('img');
                img.src = src;
                img.className = 'note-image';
                img.style.maxWidth = '120px';
                img.style.maxHeight = '120px';
                img.style.borderRadius = '8px';
                img.style.cursor = 'pointer';

                // Delete button for image
                const deleteImgBtn = document.createElement('button');
                deleteImgBtn.className = 'delete-image-btn';
                deleteImgBtn.innerHTML = '×';
                deleteImgBtn.style.position = 'absolute';
                deleteImgBtn.style.top = '-8px';
                deleteImgBtn.style.right = '-8px';
                deleteImgBtn.style.width = '20px';
                deleteImgBtn.style.height = '20px';
                deleteImgBtn.style.borderRadius = '50%';
                deleteImgBtn.style.background = 'rgba(255, 0, 0, 0.8)';
                deleteImgBtn.style.color = 'white';
                deleteImgBtn.style.border = 'none';
                deleteImgBtn.style.cursor = 'pointer';
                deleteImgBtn.style.display = 'none';
                deleteImgBtn.style.fontSize = '16px';
                deleteImgBtn.style.lineHeight = '1';
                deleteImgBtn.style.padding = '0';
                deleteImgBtn.style.zIndex = '2';

                // Show delete button on hover
                imgWrapper.addEventListener('mouseenter', () => {
                    deleteImgBtn.style.display = 'block';
                });
                imgWrapper.addEventListener('mouseleave', () => {
                    deleteImgBtn.style.display = 'none';
                });

                // Delete image functionality
                deleteImgBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this image?')) {
                        note.images.splice(imgIndex, 1);
                        localStorage.setItem('notes', JSON.stringify(notes));
                        imgWrapper.remove();
                        if (note.images.length === 0) {
                            imageGallery.style.display = 'none';
                        }
                    }
                });

                // Zoom functionality
                img.addEventListener('click', function() {
                    document.getElementById('zoomed-image').src = src;
                    zoomOverlay.style.display = 'flex';
                });

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(deleteImgBtn);
                imageGallery.appendChild(imgWrapper);
            });
        }

        // Note text
        const noteText = document.createElement('div');
        noteText.className = 'note-textarea';
        noteText.textContent = note.note || '';

        // Edit functionality
        editButton.addEventListener('click', function() {
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = titleDisplay.textContent;
            titleInput.className = 'title-input';
            
            const noteInput = document.createElement('div');
            noteInput.contentEditable = true;
            noteInput.className = 'note-textarea';
            noteInput.textContent = noteText.textContent;

            titleDisplay.replaceWith(titleInput);
            noteText.replaceWith(noteInput);

            // Save button
            const saveButton = document.createElement('button');
            saveButton.className = 'btn';
            saveButton.textContent = 'Save';
            saveButton.style.marginTop = '10px';

            saveButton.addEventListener('click', function() {
                notes[index] = {
                    title: titleInput.value,
                    note: noteInput.textContent,
                    images: note.images
                };
                localStorage.setItem('notes', JSON.stringify(notes));
                location.reload();
            });

            noteContainer.appendChild(saveButton);
        });

        // Delete functionality
        deleteButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this note?')) {
                notes.splice(index, 1);
                localStorage.setItem('notes', JSON.stringify(notes));
                noteContainer.remove();
                if (notes.length === 0) {
                    savedNotesList.innerHTML = '<div class="no-notes">No saved notes found.</div>';
                }
            }
        });

        // Assemble
        noteContainer.appendChild(titleBar);
        noteContainer.appendChild(imageGallery);
        noteContainer.appendChild(noteText);

        savedNotesList.appendChild(noteContainer);
    });
});

// Function to save a note
function saveNote(noteContainer) {
    try {
        const titleInput = noteContainer.querySelector('.title-input');
        const noteTextarea = noteContainer.querySelector('.note-textarea');
        const imageGallery = noteContainer.querySelector('.image-gallery-container');
        
        if (!titleInput || !noteTextarea) {
            throw new Error('Required note elements not found');
        }

        const title = titleInput.value.trim();
        const content = noteTextarea.value.trim();
        
        if (!title && !content) {
            showNotification('Note cannot be empty', 'error');
            return;
        }

        // Get all images from the gallery
        const images = Array.from(imageGallery.querySelectorAll('.image-wrapper img')).map(img => img.src);
        
        // Check if there are too many images
        if (images.length > 3) {
            showNotification('Maximum 3 images allowed per note', 'error');
            return;
        }

        // Create note object
        const note = {
            id: Date.now(),
            title: title || 'Untitled Note',
            note: content || 'No content',
            images: images,
            timestamp: new Date().toISOString()
        };

        // Get existing notes
        let notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Add new note
        notes.push(note);
        
        // Save to localStorage
        try {
            localStorage.setItem('notes', JSON.stringify(notes));
            showNotification('Note saved successfully!', 'success');
            
            // Clear the note container
            titleInput.value = '';
            noteTextarea.value = '';
            imageGallery.innerHTML = '';
            
            // Refresh the page to show the new note
            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (storageError) {
            console.error('Storage error:', storageError);
            showNotification('Failed to save note. Storage might be full.', 'error');
            return;
        }
        
    } catch (error) {
        console.error('Error saving note:', error);
        showNotification('Failed to save note. Please try again.', 'error');
    }
}

// Function to handle image upload
function handleImageUpload(event, noteContainer) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        const imageGallery = noteContainer.querySelector('.image-gallery-container');
        const currentImages = imageGallery.querySelectorAll('.image-wrapper img');

        // Check number of images
        if (currentImages.length >= 3) {
            showNotification('Maximum 3 images allowed per note', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'image-wrapper';
            imageWrapper.style.position = 'relative';
            imageWrapper.style.display = 'inline-block';
            imageWrapper.style.margin = '0 8px 8px 0';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Note image';
            img.className = 'note-image';
            img.style.maxWidth = '120px';
            img.style.maxHeight = '120px';
            img.style.borderRadius = '8px';
            img.style.cursor = 'pointer';
            
            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-image-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.style.position = 'absolute';
            deleteBtn.style.top = '-8px';
            deleteBtn.style.right = '-8px';
            deleteBtn.style.width = '20px';
            deleteBtn.style.height = '20px';
            deleteBtn.style.borderRadius = '50%';
            deleteBtn.style.background = 'rgba(255, 0, 0, 0.8)';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.display = 'none';
            deleteBtn.style.fontSize = '16px';
            deleteBtn.style.lineHeight = '1';
            deleteBtn.style.padding = '0';
            deleteBtn.style.zIndex = '2';

            // Show delete button on hover
            imageWrapper.addEventListener('mouseenter', () => {
                deleteBtn.style.display = 'block';
            });
            imageWrapper.addEventListener('mouseleave', () => {
                deleteBtn.style.display = 'none';
            });

            // Delete image functionality
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                imageWrapper.remove();
            });

            // Zoom functionality
            img.addEventListener('click', function() {
                const zoomOverlay = document.getElementById('image-zoom-overlay');
                if (zoomOverlay) {
                    document.getElementById('zoomed-image').src = e.target.result;
                    zoomOverlay.style.display = 'flex';
                }
            });

            imageWrapper.appendChild(img);
            imageWrapper.appendChild(deleteBtn);
            imageGallery.appendChild(imageWrapper);
        };

        reader.onerror = function() {
            showNotification('Failed to read image file', 'error');
        };

        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error handling image upload:', error);
        showNotification('Failed to upload image. Please try again.', 'error');
    }
}

// Update mobile styles
const mobileStyles = `
@media only screen and (max-width: 768px) {
    .note-container {
        width: 92% !important;
        max-width: 400px !important;
        margin: 0 auto !important;
        padding: 12px !important;
        border-radius: 12px !important;
    }

    .image-gallery-container {
        max-width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
        padding: 4px 0 !important;
    }

    .image-gallery-container::-webkit-scrollbar {
        display: none !important;
    }

    .image-gallery-container img {
        max-width: 140px !important;
        height: 110px !important;
        object-fit: cover !important;
        border-radius: 8px !important;
    }

    .note-textarea {
        min-height: 100px !important;
        font-size: 15px !important;
        line-height: 1.4 !important;
        padding: 8px !important;
    }

    .title-input {
        font-size: 16px !important;
        padding: 8px !important;
        margin-bottom: 8px !important;
    }

    .dropdown-button {
        padding: 8px !important;
        min-width: 36px !important;
        min-height: 36px !important;
    }

    .dropdown-content {
        min-width: 160px !important;
        padding: 4px 0 !important;
    }

    .dropdown-item {
        padding: 8px 12px !important;
        font-size: 14px !important;
    }

    .dropdown-item img {
        width: 16px !important;
        height: 16px !important;
        margin-right: 8px !important;
    }

    .delete-image-btn {
        width: 24px !important;
        height: 24px !important;
        font-size: 18px !important;
        top: -6px !important;
        right: -6px !important;
    }

    .notification {
        width: 90% !important;
        max-width: 320px !important;
        padding: 12px 16px !important;
        font-size: 14px !important;
        border-radius: 8px !important;
        margin: 8px !important;
    }
}

/* Additional styles for very small screens */
@media only screen and (max-width: 360px) {
    .note-container {
        width: 94% !important;
        padding: 8px !important;
    }

    .image-gallery-container img {
        max-width: 120px !important;
        height: 100px !important;
    }

    .note-textarea {
        font-size: 14px !important;
    }

    .title-input {
        font-size: 15px !important;
    }
}

/* Styles for devices with notches */
@supports (padding: max(0px)) {
    .note-container {
        padding-left: max(12px, env(safe-area-inset-left)) !important;
        padding-right: max(12px, env(safe-area-inset-right)) !important;
    }
}
`;

// Add mobile styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileStyles;
document.head.appendChild(styleSheet);

// Function to show notifications
function showNotification(message, type) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add animation
    notification.style.animation = 'slideIn 0.3s ease-out';

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
