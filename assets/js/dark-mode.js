// Dark Mode Toggle Handler
(function () {
    'use strict';

    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Create and inject dark mode toggle button
    function createDarkModeToggle() {
        const button = document.createElement('button');
        button.className = 'dark-mode-toggle';
        button.setAttribute('aria-label', 'Toggle dark mode');
        button.innerHTML = currentTheme === 'dark'
            ? '<span class="icon">☀️</span>'
            : '<span class="icon">🌙</span>';

        document.body.appendChild(button);

        button.addEventListener('click', toggleDarkMode);
    }

    function toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update button icon
        const button = document.querySelector('.dark-mode-toggle');
        button.innerHTML = newTheme === 'dark'
            ? '<span class="icon">☀️</span>'
            : '<span class="icon">🌙</span>';
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDarkModeToggle);
    } else {
        createDarkModeToggle();
    }
})();
