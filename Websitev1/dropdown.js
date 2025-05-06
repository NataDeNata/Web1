/**
 * Dropdown Menu Positioning Script
 * This script ensures dropdowns appear outside the note container
 * and properly positioned relative to their trigger buttons.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all dropdown buttons
    const dropdownButtons = document.querySelectorAll('.dropdown-button');
    
    // Add click event listeners to each button
    dropdownButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            
            // Get the dropdown ID from the button
            const dropdownId = this.getAttribute('data-dropdown-id');
            // Find the associated dropdown content
            const dropdown = document.getElementById(dropdownId);
            
            // Move dropdown to body if it's not already there
            if (dropdown.parentElement !== document.body) {
                document.body.appendChild(dropdown);
            }
            
            // Toggle the dropdown visibility
            const isVisible = dropdown.classList.contains('show');
            
            // Close all other open dropdowns first
            document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
                openDropdown.classList.remove('show');
            });
            
            // If this dropdown wasn't already open, position and show it
            if (!isVisible) {
                // Get the position of the button
                const buttonRect = this.getBoundingClientRect();
                
                // Position the dropdown above and to the left of the button
                dropdown.style.position = 'fixed';
                
                // Get dropdown dimensions
                dropdown.style.visibility = 'hidden';
                dropdown.style.display = 'block';
                const dropdownRect = dropdown.getBoundingClientRect();
                dropdown.style.display = 'none';
                dropdown.style.visibility = 'visible';
                
                // Position above and to the left
                dropdown.style.top = `${buttonRect.bottom}px`; // Align directly below the button
                dropdown.style.left = `${buttonRect.left}px`; // Align with the left edge of the button
                dropdown.style.zIndex = '1001'; // Ensure dropdown is above other elements
                // Show the dropdown
                dropdown.classList.add('show');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-content') && !e.target.closest('.dropdown-button')) {
            document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
});