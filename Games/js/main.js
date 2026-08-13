// LifeHelpers Arcade loader
(function () {
    'use strict';

    const catalog = Array.isArray(window.LIFEHELPERS_GAME_CATALOG) ? window.LIFEHELPERS_GAME_CATALOG : [];
    const state = { filter: 'all', query: '' };
    let lastFocusedElement = null;

    document.addEventListener('DOMContentLoaded', () => {
        initializeNavigation();
        initializeLibrary();
        initializePlayer();
        initializeMobileOptimizations();
        preloadResources();
    });

    function initializeNavigation() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', event => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
            });
        });

        const header = document.querySelector('.header');
        window.addEventListener('scroll', debounce(() => {
            if (!header) return;
            if (window.scrollY > 100) {
                header.style.background = 'rgba(79, 70, 229, 0.95)';
                header.style.backdropFilter = 'blur(20px)';
            } else {
                header.style.background = 'linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,.05))';
                header.style.backdropFilter = 'blur(10px)';
            }
        }, 16));
    }

    function initializeLibrary() {
        const search = document.getElementById('game-search');
        const filterButtons = document.querySelectorAll('.filter-button');

        if (search) {
            search.addEventListener('input', debounce(() => {
                state.query = search.value.trim().toLocaleLowerCase();
                renderGames();
            }, 100));
        }

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                state.filter = button.dataset.filter || 'all';
                filterButtons.forEach(other => {
                    const active = other === button;
                    other.classList.toggle('active', active);
                    other.setAttribute('aria-pressed', String(active));
                });
                renderGames();
            });
        });

        const note = document.getElementById('device-note');
        if (note && isTouchDevice()) {
            note.textContent = 'Desktop-only games may require a keyboard/mouse.';
        }
        renderGames();
    }

    function filteredCatalog() {
        return catalog.filter(game => {
            const folderMatches = state.filter === 'all' || game.folder === state.filter;
            if (!folderMatches) return false;
            if (!state.query) return true;
            const haystack = [game.title, game.file, game.folder, game.source, ...(game.tags || [])].join(' ').toLocaleLowerCase();
            return haystack.includes(state.query);
        }).sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));
    }

    function renderGames() {
        const grid = document.getElementById('games-grid');
        const count = document.getElementById('visible-count');
        const empty = document.getElementById('empty-state');
        if (!grid) return;

        const games = filteredCatalog();
        grid.replaceChildren(...games.map(createGameCard));
        if (count) count.textContent = `${games.length} game${games.length === 1 ? '' : 's'}`;
        if (empty) empty.hidden = games.length !== 0;
        initializeCardAnimations();
    }

    function createGameCard(game) {
        const card = document.createElement('article');
        card.className = 'game-card glass';
        card.dataset.folder = game.folder;

        const preview = document.createElement('div');
        preview.className = 'game-preview';
        preview.textContent = game.icon || '🎮';

        const info = document.createElement('div');
        info.className = 'game-info';

        const badge = document.createElement('span');
        badge.className = `compat-badge ${game.folder === 'desktop' ? 'desktop-badge' : 'both-badge'}`;
        badge.textContent = game.folder === 'desktop' ? 'Desktop' : 'Desktop + Mobile';

        const title = document.createElement('h3');
        title.className = 'game-title';
        title.textContent = game.title;

        const description = document.createElement('p');
        description.className = 'game-description';
        description.textContent = game.bundled
            ? `Bundled with the arcade and stored at ${game.path.replace('./', '')}.`
            : `Manifest entry: ${game.file}. Source set: ${game.source || game.folder}.`;

        const tags = document.createElement('div');
        tags.className = 'game-tags';
        const tagValues = [...new Set([game.folder === 'desktop' ? 'Desktop' : 'Both', ...(game.tags || [])])].slice(0, 4);
        tagValues.forEach(value => {
            const tag = document.createElement('span');
            tag.className = 'game-tag';
            tag.textContent = value;
            tags.appendChild(tag);
        });

        const button = document.createElement('button');
        button.className = 'play-button';
        button.type = 'button';
        button.innerHTML = '<span aria-hidden="true">▶️</span> Play';
        button.addEventListener('click', () => openGame(game, button));

        info.append(badge, title, description, tags, button);
        card.append(preview, info);
        return card;
    }

    function initializeCardAnimations() {
        if (!('IntersectionObserver' in window) || prefersReducedMotion()) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.game-card').forEach(card => observer.observe(card));
    }

    function initializePlayer() {
        document.querySelectorAll('[data-close-game]').forEach(control => control.addEventListener('click', closeGame));
        document.addEventListener('keydown', event => {
            const modal = document.getElementById('game-modal');
            if (event.key === 'Escape' && modal && !modal.hidden) closeGame();
        });
    }

    function openGame(game, sourceElement) {
        const modal = document.getElementById('game-modal');
        const frame = document.getElementById('game-frame');
        const title = document.getElementById('game-player-title');
        const compat = document.getElementById('game-player-compat');
        const external = document.getElementById('open-game-new');
        if (!modal || !frame || !title || !compat || !external) {
            window.location.href = game.path;
            return;
        }
        lastFocusedElement = sourceElement || document.activeElement;
        title.textContent = game.title;
        compat.textContent = game.folder === 'desktop' ? 'Desktop' : 'Desktop + Mobile';
        compat.className = `compat-badge ${game.folder === 'desktop' ? 'desktop-badge' : 'both-badge'}`;
        external.href = game.path;
        frame.src = game.path;
        frame.title = `${game.title} game player`;
        modal.hidden = false;
        document.body.classList.add('game-open');
        document.getElementById('close-game')?.focus();
    }

    function closeGame() {
        const modal = document.getElementById('game-modal');
        const frame = document.getElementById('game-frame');
        if (!modal) return;
        modal.hidden = true;
        document.body.classList.remove('game-open');
        if (frame) frame.src = 'about:blank';
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
    }

    function initializeMobileOptimizations() {
        if (isTouchDevice()) document.body.classList.add('mobile-device');
        window.addEventListener('resize', debounce(() => {}, 250));
    }

    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function preloadResources() {
        ['./images/background.jpg', './images/og-image.svg'].forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
})();
