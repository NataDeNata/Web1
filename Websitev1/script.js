const noteContainers = document.querySelector('.note-containers');
const createNoteButton = document.querySelector('.btn');
let noteCount = 0;
const MAX_NOTES = 4;

createNoteButton.addEventListener('click', function() {
    // Check if we've reached the maximum number of notes
    if (noteCount >= MAX_NOTES) {
        alert('You have reached the maximum number of notes (4). Please save your notes before creating more.');
        return;
    }

    // Check if there are unsaved notes
    const unsavedNotes = document.querySelectorAll('.note-container:not(.saved)');
    if (unsavedNotes.length > 0) {
        const saveFirst = confirm('You have unsaved notes. Would you like to save them before creating a new note?');
        if (saveFirst) {
            unsavedNotes.forEach(note => {
                const saveButton = note.querySelector('.dropdown-item:has(.save-icon)');
                if (saveButton) saveButton.click();
            });
        }
    }
    
  const noteContainer = document.createElement('div');
  noteContainer.className = 'note-container';
    noteContainer.style.margin = '20px'; // Add spacing between note containers

    // Title bar with dropdown
    const titleBar = document.createElement('div');
    titleBar.className = 'title-bar';

    // Title input
  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'title-input';
    titleInput.placeholder = 'Enter title...';

    // Dropdown button
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'dropdown-button';
    const dropdownIcon = document.createElement('img');
    // Set initial icon based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    dropdownIcon.src = currentTheme === 'dark' ? 'downAlt.png' : 'dropDown2.png';
    dropdownIcon.alt = 'Dropdown';
    dropdownButton.appendChild(dropdownIcon);

    // Dropdown content
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-content';

    // Save button
    const saveButton = document.createElement('button');
    saveButton.className = 'dropdown-item';
    const saveIcon = document.createElement('img');
    saveIcon.src = currentTheme === 'dark' ? 'saveAlt.png' : 'save.png';
    saveIcon.alt = 'Save';
    saveButton.appendChild(saveIcon);
    const saveText = document.createElement('span');
    saveText.textContent = 'Save';
    saveButton.appendChild(saveText);

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

    // Add buttons to dropdown
    dropdownContent.appendChild(saveButton);
    dropdownContent.appendChild(deleteButton);

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
    dropdownContent.appendChild(addImageButton);

    // Add elements to title bar
    titleBar.appendChild(titleInput);
    titleBar.appendChild(dropdownButton);
    titleBar.appendChild(dropdownContent);

    // Note textarea
    const noteTextarea = document.createElement('div');
    noteTextarea.className = 'note-textarea';
    noteTextarea.contentEditable = true;
    noteTextarea.placeholder = 'Enter your note...';

    // Image gallery container
    const imageGallery = document.createElement('div');
    imageGallery.className = 'image-gallery-container';
    imageGallery.style.display = 'none';

    // Image input
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';
    imageInput.id = 'imageInput-' + Date.now();

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

    // Handle image upload
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'image-wrapper';
                imgWrapper.style.position = 'relative';
                imgWrapper.style.display = 'inline-block';
                imgWrapper.style.margin = '0 8px 8px 0';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'note-image';
                img.style.maxWidth = '120px';
                img.style.maxHeight = '120px';
                img.style.borderRadius = '8px';
                img.style.cursor = 'pointer';
                img.setAttribute('data-tooltip', 'Click to zoom in');
                img.style.position = 'relative';

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
                deleteImgBtn.setAttribute('data-tooltip', 'Delete image');

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
                    imgWrapper.remove();
                    if (imageGallery.children.length === 0) {
                        imageGallery.style.display = 'none';
                    }
                });

                // Zoom functionality
                img.addEventListener('click', function() {
                    document.getElementById('zoomed-image').src = e.target.result;
                    zoomOverlay.style.display = 'flex';
                });

                imgWrapper.appendChild(img);
                imgWrapper.appendChild(deleteImgBtn);
                imageGallery.appendChild(imgWrapper);
                imageGallery.style.display = 'flex';

                // Show notification about zoom functionality
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.textContent = 'Click on the image to zoom in';
                noteContainer.appendChild(notification);

                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            };
            reader.readAsDataURL(file);
        }
    });

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                const newTheme = document.documentElement.getAttribute('data-theme');
                // Update all icons based on new theme
                dropdownIcon.src = newTheme === 'dark' ? 'downAlt.png' : 'downAlt.png';
                saveIcon.src = newTheme === 'dark' ? 'saveAlt.png' : 'saveAlt.png';
                deleteIcon.src = newTheme === 'dark' ? 'trashAlt.png' : 'trashAlt.png';
                addImageIcon.src = newTheme === 'dark' ? 'add-imgAtch.png' : 'imgAtch.png';
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
        
        // Toggle dropdown
        dropdownContent.classList.toggle('show');
        
        // Update icon based on current theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        dropdownIcon.src = dropdownContent.classList.contains('show') 
            ? (currentTheme === 'dark' ? 'downAlt.png' : 'downAlt.png')
            : (currentTheme === 'dark' ? 'downAlt.png' : 'downAlt.png');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdownContent.contains(e.target) && !dropdownButton.contains(e.target)) {
            dropdownContent.classList.remove('show');
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            dropdownIcon.src = currentTheme === 'dark' ? 'downAlt.png' : 'downAlt.png';
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (dropdownContent.classList.contains('show')) {
            const buttonRect = dropdownButton.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            dropdownContent.style.top = `${buttonRect.bottom + scrollTop + 5}px`;
            dropdownContent.style.right = `${window.innerWidth - buttonRect.right + scrollLeft}px`;
        }
    });

    // Save functionality
    saveButton.addEventListener('click', function() {
        const title = titleInput.value.trim();
        const note = noteTextarea.textContent.trim();
        const images = Array.from(imageGallery.querySelectorAll('.image-wrapper img')).map(img => img.src);

        // Validate note content
        if (!title && !note && images.length === 0) {
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'Please add some content to your note before saving.';
            noteContainer.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
            return;
        }

        // Validate image count
        if (images.length > 3) {
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'Maximum 3 images allowed per note.';
            noteContainer.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
            return;
        }

        try {
            const notes = JSON.parse(localStorage.getItem('notes')) || [];
            const newNote = {
                id: Date.now(),
                title: title || 'Untitled Note',
                note: note || 'No content',
                images: images,
                timestamp: new Date().toISOString()
            };
            
            notes.push(newNote);
            localStorage.setItem('notes', JSON.stringify(notes));

            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.textContent = 'Note saved successfully!';
            noteContainer.appendChild(notification);

            // Remove notification and refresh after 1 second
            setTimeout(() => {
                notification.remove();
                location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error saving note:', error);
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'Failed to save note. Please try again.';
            noteContainer.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }
    });

    // Delete functionality
    deleteButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this note?')) {
            noteContainer.remove();
        }
    });

    // Add Image button functionality
    addImageButton.addEventListener('click', function() {
        const currentImages = imageGallery.querySelectorAll('.image-wrapper img');
        if (currentImages.length >= 3) {
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'Maximum 3 images allowed per note.';
            noteContainer.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
            return;
        }
        imageInput.click();
    });

    // Add tooltips to dropdown buttons
    dropdownButton.setAttribute('data-tooltip', 'More options');
    saveButton.setAttribute('data-tooltip', 'Save note');
    deleteButton.setAttribute('data-tooltip', 'Delete note');
    addImageButton.setAttribute('data-tooltip', 'Add image');

    // Assemble
    noteContainer.appendChild(titleBar);
    noteContainer.appendChild(imageGallery);
    noteContainer.appendChild(noteTextarea);
    noteContainer.appendChild(imageInput);

  document.querySelector('.note-containers').appendChild(noteContainer);
  noteCount++;
});
