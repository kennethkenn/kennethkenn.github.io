// Theme toggle handler
(function () {
    'use strict';

    var STORAGE_KEY = 'theme';
    var root = document.documentElement;

    var ICONS = {
        // Moon — shown when the site is in light mode
        light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
        // Sun — shown when the site is in dark mode
        dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
    };

    function currentTheme() {
        return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function syncThemeColor() {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', currentTheme() === 'dark' ? '#121311' : '#FAF9F5');
        }
    }

    function makeToggle() {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'dark-mode-toggle';
        button.addEventListener('click', toggleTheme);

        var actions = document.querySelector('.header-actions');
        var navToggle = actions && actions.querySelector('.nav-toggle');

        if (actions) {
            actions.insertBefore(button, navToggle || null);
        } else {
            button.classList.add('is-floating');
            document.body.appendChild(button);
        }

        syncToggle(button);
        syncThemeColor();
    }

    function syncToggle(button) {
        var btn = button || document.querySelector('.dark-mode-toggle');
        if (!btn) return;

        var theme = currentTheme();
        btn.innerHTML = theme === 'dark' ? ICONS.dark : ICONS.light;
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    function toggleTheme() {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);

        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch (e) { }

        syncToggle();
        syncThemeColor();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', makeToggle);
    } else {
        makeToggle();
    }
})();
