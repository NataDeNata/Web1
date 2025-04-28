document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.main-nav');
    const body = document.body;
    let isAnimating = false;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    body.appendChild(overlay);

    // Toggle menu function with animation lock
    function toggleMenu() {
        if (isAnimating) return;
        isAnimating = true;

        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (nav.classList.contains('active')) {
            body.style.overflow = 'hidden';
            // Add escape key listener
            document.addEventListener('keydown', handleEscapeKey);
        } else {
            body.style.overflow = '';
            // Remove escape key listener
            document.removeEventListener('keydown', handleEscapeKey);
        }

        // Reset animation lock after transition
        setTimeout(() => {
            isAnimating = false;
        }, 300);
    }

    // Handle escape key
    function handleEscapeKey(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            toggleMenu();
        }
    }

    // Event listeners with passive option for better scroll performance
    hamburger.addEventListener('click', toggleMenu, { passive: true });
    overlay.addEventListener('click', toggleMenu, { passive: true });

    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (nav.classList.contains('active')) {
                e.preventDefault();
                const href = link.getAttribute('href');
                toggleMenu();
                // Navigate after animation
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });

    // Handle window resize with debounce
    let resizeTimer;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768 && nav.classList.contains('active')) {
                toggleMenu();
            }
        }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Clean up event listeners on page unload
    window.addEventListener('unload', () => {
        document.removeEventListener('keydown', handleEscapeKey);
        window.removeEventListener('resize', handleResize);
    });
}); 