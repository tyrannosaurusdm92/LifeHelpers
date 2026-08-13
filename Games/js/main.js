// LifeHelpers Arcade - Main JavaScript
// The game catalog is declared in game-catalog.js so this loader works from GitHub Pages
// and when index.html is opened directly from disk.

(() => {
    'use strict';

    const catalog = Array.isArray(window.LIFEHELPERS_GAME_CATALOG)
        ? window.LIFEHELPERS_GAME_CATALOG
        : [];

    const state = {
        filter: 'All',
        query: ''
    };

    document.addEventListener('DOMContentLoaded', () => {
        initializeNavigation();
        initializeCatalog();
        initializeMobileOptimizations();
        preloadResources();
        console.log(`🎮 LifeHelpers Arcade loaded ${catalog.length} catalog entries.`);
    });

    function initializeCatalog() {
        const grid = document.getElementById('games-grid');
        const search = document.getElementById('game-search');
        const clearSearch = document.getElementById('clear-search');
        if (!grid || !search) return;

        updateCounts();
        renderCatalog();

        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', () => {
                state.filter = button.dataset.filter || 'All';
                document.querySelectorAll('.filter-button').forEach(item => {
                    const active = item === button;
                    item.classList.toggle('active', active);
                    item.setAttribute('aria-pressed', String(active));
                });
                renderCatalog();
            });
        });

        search.addEventListener('input', debounce(() => {
            state.query = search.value.trim().toLocaleLowerCase();
            if (clearSearch) clearSearch.hidden = state.query.length === 0;
            renderCatalog();
        }, 100));

        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                search.value = '';
                state.query = '';
                clearSearch.hidden = true;
                search.focus();
                renderCatalog();
            });
        }
    }

    function updateCounts() {
        const both = catalog.filter(game => game.collection === 'Both').length;
        const desktop = catalog.filter(game => game.collection === 'Desktop').length;
        setText('count-all', catalog.length);
        setText('count-both', both);
        setText('count-desktop', desktop);
    }

    function renderCatalog() {
        const grid = document.getElementById('games-grid');
        const summary = document.getElementById('catalog-summary');
        if (!grid) return;

        const visibleGames = catalog.filter(game => {
            const matchesFilter = state.filter === 'All' || game.collection === state.filter;
            const haystack = `${game.title} ${game.file} ${game.collection}`.toLocaleLowerCase();
            const matchesQuery = !state.query || haystack.includes(state.query);
            return matchesFilter && matchesQuery;
        });

        grid.replaceChildren();

        if (!visibleGames.length) {
            const empty = document.createElement('div');
            empty.className = 'empty-state glass';
            empty.textContent = 'No games match the current filter or search.';
            grid.appendChild(empty);
        } else {
            const fragment = document.createDocumentFragment();
            visibleGames.forEach(game => fragment.appendChild(createGameCard(game)));
            grid.appendChild(fragment);
        }

        if (summary) {
            const filterLabel = state.filter === 'All' ? 'all collections' : state.filter;
            const searchLabel = state.query ? ` matching “${state.query}”` : '';
            summary.textContent = `Showing ${visibleGames.length} of ${catalog.length} games from ${filterLabel}${searchLabel}.`;
        }

        initializeAnimations();
    }

    function createGameCard(game) {
        const card = document.createElement('a');
        card.className = 'game-card glass';
        card.href = encodeURI(game.path);
        card.dataset.collection = game.collection;
        card.dataset.gameId = game.id;
        card.setAttribute('aria-label', `Play ${game.title}`);

        const preview = document.createElement('div');
        preview.className = 'game-preview game-preview-catalog';
        preview.textContent = iconForGame(game);

        const info = document.createElement('div');
        info.className = 'game-info';

        const title = document.createElement('h3');
        title.className = 'game-title';
        title.textContent = game.title;

        const description = document.createElement('p');
        description.className = 'game-description catalog-description';
        description.textContent = game.collection === 'Both'
            ? 'Desktop + mobile/touch collection'
            : 'Desktop-focused collection';

        const path = document.createElement('code');
        path.className = 'game-path';
        path.textContent = game.path.replace('./', '');

        const tags = document.createElement('div');
        tags.className = 'game-tags';
        tags.appendChild(makeTag(game.collection));
        tags.appendChild(makeTag(game.bundled ? 'Bundled' : 'Manifest'));

        const play = document.createElement('span');
        play.className = 'play-button';
        play.innerHTML = '<span aria-hidden="true">▶️</span><span>Play Now</span>';

        info.append(title, description, path, tags, play);
        card.append(preview, info);

        card.addEventListener('click', event => addRipple(card, event));
        return card;
    }

    function makeTag(label) {
        const tag = document.createElement('span');
        tag.className = 'game-tag';
        tag.textContent = label;
        return tag;
    }

    function iconForGame(game) {
        const title = game.title.toLocaleLowerCase();
        if (title.includes('chess')) return '♟️';
        if (title.includes('solitaire') || title.includes('card')) return '🃏';
        if (title.includes('sudoku') || title.includes('wordle') || title.includes('riddle')) return '🧩';
        if (title.includes('archery')) return '🏹';
        if (title.includes('ping pong')) return '🏓';
        if (title.includes('tetris') || title.includes('stack')) return '🧱';
        if (title.includes('bird')) return '🐦';
        if (title.includes('zombie') || title.includes('fnaf')) return '👾';
        if (title.includes('runner') || title.includes('run')) return '🏃';
        if (title.includes('car') || title.includes('racer') || title.includes('ride')) return '🏎️';
        if (title.includes('papa')) return '🍔';
        if (title.includes('bottle')) return '🌈';
        return game.collection === 'Both' ? '📱🎮' : '💻🎮';
    }

    function addRipple(card, event) {
        if (event.detail === 0) return; // Keyboard activation should not synthesize a pointer ripple.
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'card-ripple';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
        card.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 650);
    }

    function initializeAnimations() {
        const elements = document.querySelectorAll('.game-card:not(.observed), .section-title:not(.observed)');
        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('fade-in-up', 'observed'));
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        elements.forEach(el => {
            el.classList.add('observed');
            observer.observe(el);
        });
    }

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
        const updateHeader = () => {
            if (!header) return;
            if (window.scrollY > 80) {
                header.style.background = 'rgba(79, 70, 229, 0.95)';
                header.style.backdropFilter = 'blur(20px)';
            } else {
                header.style.background = 'linear-gradient(180deg, rgba(255,255,255,.25), rgba(255,255,255,.05))';
                header.style.backdropFilter = 'blur(10px)';
            }
        };
        updateHeader();
        window.addEventListener('scroll', debounce(updateHeader, 16), { passive: true });
    }

    function initializeMobileOptimizations() {
        const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (touch) document.body.classList.add('mobile-device');
    }

    function preloadResources() {
        ['./images/background.jpg', './images/og-image.svg'].forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value);
    }

    function debounce(fn, wait) {
        let timeout;
        return (...args) => {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(() => fn(...args), wait);
        };
    }
})();
