// The Mint Coder - site interactions
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var root = document.documentElement;

  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function pad(value) {
    return String(value).padStart(3, '0');
  }

  onReady(function () {
    // ----------------------------------------------------------------------
    // First-paint state
    // ----------------------------------------------------------------------
    requestAnimationFrame(function () {
      window.setTimeout(function () {
        document.body.classList.add('is-ready');
      }, 80);
    });

    // ----------------------------------------------------------------------
    // Scroll reveal
    // ----------------------------------------------------------------------
    var revealItems = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window && !reduceMotion) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -6% 0px' });

      each(revealItems, function (item) {
        revealObserver.observe(item);
      });
    } else {
      each(revealItems, function (item) {
        item.classList.add('is-inview');
      });
    }

    // ----------------------------------------------------------------------
    // Header, progress rail, and scroll state
    // ----------------------------------------------------------------------
    var header = document.querySelector('#site-header');
    var progress = document.querySelector('[data-scroll-progress]');
    var ticking = false;

    function updateScroll() {
      var top = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var amount = max > 0 ? clamp(top / max, 0, 1) : 0;

      if (header) {
        header.classList.toggle('scrolled', top > 8);
      }
      if (progress) {
        progress.style.transform = 'scaleX(' + amount + ')';
      }
      ticking = false;
    }

    function requestScrollUpdate() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScroll);
      }
    }

    updateScroll();
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate, { passive: true });

    // ----------------------------------------------------------------------
    // Mobile navigation
    // ----------------------------------------------------------------------
    var navToggle = document.querySelector('.nav-toggle');
    var navMenu = document.querySelector('.nav-menu');

    function setMenu(open) {
      if (!navToggle || !navMenu) return;
      navToggle.classList.toggle('active', open);
      navMenu.classList.toggle('active', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    }

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        setMenu(!navMenu.classList.contains('active'));
      });

      document.addEventListener('click', function (event) {
        if (navMenu.classList.contains('active') &&
          !navMenu.contains(event.target) &&
          !navToggle.contains(event.target)) {
          setMenu(false);
        }
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
          setMenu(false);
          navToggle.focus();
        }
      });

      each(navMenu.querySelectorAll('a'), function (link) {
        link.addEventListener('click', function () { setMenu(false); });
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 1020 && navMenu.classList.contains('active')) {
          setMenu(false);
        }
      });
    }

    // ----------------------------------------------------------------------
    // Blog topic filter
    // ----------------------------------------------------------------------
    var filterBar = document.querySelector('[data-blog-filters]');
    var blogGrid = document.querySelector('[data-blog-grid]');

    if (filterBar && blogGrid) {
      var cards = Array.prototype.slice.call(blogGrid.querySelectorAll('.blog-card'));
      var chips = Array.prototype.slice.call(filterBar.querySelectorAll('.filter-chip'));
      var status = document.querySelector('[data-filter-status]');

      var applyFilter = function (slug, label) {
        var shown = 0;

        cards.forEach(function (card) {
          var topics = (card.getAttribute('data-topics') || '').split('|');
          var match = slug === 'all' || topics.indexOf(slug) !== -1;
          card.hidden = !match;
          if (match) {
            shown++;
            card.classList.add('is-inview');
          }
        });

        chips.forEach(function (chip) {
          var isActive = chip.getAttribute('data-filter') === slug;
          chip.classList.toggle('is-active', isActive);
          chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (status) {
          status.textContent = slug === 'all'
            ? 'Showing all ' + shown + ' entries.'
            : shown + ' ' + (shown === 1 ? 'entry' : 'entries') + ' in ' + label + '.';
        }
      };

      filterBar.addEventListener('click', function (event) {
        var chip = event.target.closest('.filter-chip');
        if (!chip) return;
        applyFilter(chip.getAttribute('data-filter'), chip.textContent.trim());
      });

      applyFilter('all', 'All');
    }

    // ----------------------------------------------------------------------
    // Project archive search
    // ----------------------------------------------------------------------
    var projectSearch = document.querySelector('[data-project-search]');
    var projectGrid = document.querySelector('[data-project-grid]');

    if (projectSearch && projectGrid) {
      var projectCards = Array.prototype.slice.call(projectGrid.querySelectorAll('[data-project-card]'));
      var projectStatus = document.querySelector('[data-project-status]');
      var searchTimer = null;

      var applyProjectSearch = function () {
        var query = projectSearch.value.trim().toLowerCase();
        var shown = 0;

        projectCards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '') + ' ' + card.textContent.toLowerCase();
          var match = !query || haystack.indexOf(query) !== -1;
          card.hidden = !match;
          if (match) {
            shown++;
            card.classList.add('is-inview');
          }
        });

        if (projectStatus) {
          projectStatus.textContent = query
            ? shown + ' of ' + projectCards.length + ' plates match "' + projectSearch.value.trim() + '".'
            : '';
        }
      };

      projectSearch.addEventListener('input', function () {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(applyProjectSearch, 100);
      });

      applyProjectSearch();
    }

    // ----------------------------------------------------------------------
    // Cursor-following project preview
    // ----------------------------------------------------------------------
    var workList = document.querySelector('[data-work-list]');
    var workPreview = document.querySelector('[data-work-preview]');

    if (workList && workPreview) {
      var previewImage = workPreview.querySelector('img');
      var workRows = Array.prototype.slice.call(workList.querySelectorAll('[data-work-row]'));
      var pointerType = 'mouse';

      function placePreview(event) {
        var rect = workList.getBoundingClientRect();
        workPreview.style.left = (event.clientX - rect.left) + 'px';
        workPreview.style.top = (event.clientY - rect.top) + 'px';
      }

      workRows.forEach(function (row) {
        var image = row.getAttribute('data-image');

        row.addEventListener('pointerenter', function (event) {
          pointerType = event.pointerType || 'mouse';
          if (pointerType === 'touch') return;
          if (image && previewImage) previewImage.src = image;
          workPreview.classList.add('is-active');
          placePreview(event);
        });

        row.addEventListener('pointermove', function (event) {
          if (pointerType !== 'touch') placePreview(event);
        });

        row.addEventListener('pointerleave', function () {
          workPreview.classList.remove('is-active');
        });

        row.addEventListener('focus', function () {
          if (image && previewImage) previewImage.src = image;
          var rect = row.getBoundingClientRect();
          var listRect = workList.getBoundingClientRect();
          workPreview.style.left = (listRect.width * 0.76) + 'px';
          workPreview.style.top = (rect.top - listRect.top + rect.height / 2) + 'px';
          workPreview.classList.add('is-active');
        });

        row.addEventListener('blur', function () {
          workPreview.classList.remove('is-active');
        });
      });

      workList.addEventListener('pointerleave', function () {
        workPreview.classList.remove('is-active');
      });
    }

    // ----------------------------------------------------------------------
    // Magnetic controls
    // ----------------------------------------------------------------------
    if (finePointer && !reduceMotion) {
      each(document.querySelectorAll('[data-magnetic]'), function (element) {
        element.addEventListener('pointermove', function (event) {
          var rect = element.getBoundingClientRect();
          var x = event.clientX - rect.left - rect.width / 2;
          var y = event.clientY - rect.top - rect.height / 2;
          element.style.transform = 'translate(' + (x * 0.07) + 'px,' + (y * 0.07) + 'px)';
        });

        element.addEventListener('pointerleave', function () {
          element.style.transform = '';
        });
      });
    }

    // ----------------------------------------------------------------------
    // Copy email address
    // ----------------------------------------------------------------------
    var copyButton = document.querySelector('[data-copy-email]');

    if (copyButton) {
      copyButton.addEventListener('click', function () {
        var email = copyButton.getAttribute('data-email');
        var label = copyButton.querySelector('[data-copy-label]') || copyButton;
        var original = label.textContent;

        var finish = function (ok) {
          copyButton.classList.toggle('is-copied', ok);
          label.textContent = ok ? 'Copied' : 'Copy failed';
          window.setTimeout(function () {
            label.textContent = original;
            copyButton.classList.remove('is-copied');
          }, 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(function () { finish(true); }).catch(function () { finish(false); });
        } else {
          finish(false);
        }
      });
    }

    // ----------------------------------------------------------------------
    // Code block copy buttons
    // ----------------------------------------------------------------------
    each(document.querySelectorAll('.post-body pre'), function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;

      var language = 'code';
      var probe = pre;
      while (probe && probe !== document.body) {
        var match = (probe.className || '').match(/language-([a-z0-9+#-]+)/i);
        if (match) {
          language = match[1];
          break;
        }
        probe = probe.parentElement;
      }

      var block = document.createElement('div');
      block.className = 'code-block';
      block.setAttribute('data-lang', language);
      pre.parentNode.insertBefore(block, pre);
      block.appendChild(pre);

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy';
      button.textContent = 'Copy';

      button.addEventListener('click', function () {
        var text = code.innerText;
        var done = function () {
          button.textContent = 'Copied';
          window.setTimeout(function () { button.textContent = 'Copy'; }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(done);
        } else {
          done();
        }
      });

      block.appendChild(button);
    });

    // ----------------------------------------------------------------------
    // Hero drafting field
    // ----------------------------------------------------------------------
    initHeroCanvas();
  });

  function hexToRgba(hex, alpha) {
    var value = (hex || '').replace('#', '').trim();
    if (value.length === 3) {
      value = value.charAt(0) + value.charAt(0) + value.charAt(1) + value.charAt(1) + value.charAt(2) + value.charAt(2);
    }
    if (value.length !== 6) return 'rgba(30,107,76,' + alpha + ')';

    var r = parseInt(value.slice(0, 2), 16);
    var g = parseInt(value.slice(2, 4), 16);
    var b = parseInt(value.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function initHeroCanvas() {
    var hero = document.querySelector('[data-hero]');
    var canvas = document.querySelector('[data-hero-canvas]');
    if (!hero || !canvas || !canvas.getContext) return;

    var context = canvas.getContext('2d');
    if (!context) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var colors = { mint: '#1E6B4C', copper: '#B15E2E' };
    var pointer = { x: -999, y: -999, active: false };
    var width = 0;
    var height = 0;
    var visible = true;
    var raf = null;
    var startTime = 0;

    function readColors() {
      var styles = getComputedStyle(root);
      colors.mint = styles.getPropertyValue('--mint').trim() || colors.mint;
      colors.copper = styles.getPropertyValue('--copper').trim() || colors.copper;
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      draw(performance.now());
    }

    function draw(now) {
      if (!width || !height) return;

      var elapsed = (now - startTime) / 1000;
      context.clearRect(0, 0, width, height);

      // A slow field of drafting nodes. Most of the grid stays almost still;
      // the pointer lifts only the dots within a short radius.
      var gap = 46;
      var col = 0;

      for (var x = gap * 0.5; x < width; x += gap) {
        var row = 0;

        for (var y = gap * 0.5; y < height; y += gap) {
          var wave = Math.sin(elapsed * 0.4 + col * 0.45 + row * 0.3);
          var alpha = 0.035 + (wave + 1) * 0.018;

          if (pointer.active) {
            var dx = x - pointer.x;
            var dy = y - pointer.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            alpha += Math.max(0, 1 - distance / 170) * 0.22;
          }

          if (alpha > 0.012) {
            context.globalAlpha = alpha;
            context.fillStyle = colors.mint;
            context.fillRect(x - 1, y - 1, 2, 2);
          }

          row++;
        }

        col++;
      }

      context.globalAlpha = 1;

      // Two contour lines, drawn like a slow plotter trace.
      function contourY(px, amplitude, phase) {
        var progress = px / Math.max(width, 1);
        var py = height * 0.62 +
          Math.sin(progress * 5.2 + elapsed * 0.22 + phase) * amplitude +
          Math.sin(progress * 2.4 - elapsed * 0.16 + phase) * amplitude * 0.4;

        if (pointer.active) {
          var diff = px - pointer.x;
          py += Math.exp(-(diff * diff) / (2 * 150 * 150)) *
            Math.sin(diff * 0.055 + elapsed * 1.6) * 14;
        }

        return py;
      }

      function contour(amplitude, color, alpha, phase) {
        context.beginPath();

        for (var px = 0; px <= width; px += 4) {
          var py = contourY(px, amplitude, phase);
          if (px === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        }

        context.strokeStyle = color;
        context.globalAlpha = alpha;
        context.lineWidth = 1;
        context.stroke();
        context.globalAlpha = 1;
      }

      contour(30, colors.mint, 0.16, 0);
      contour(20, colors.copper, 0.1, 1.4);

      // A small plotter marker travels the main contour, leaving a soft glow.
      if (!reduceMotion) {
        var markerX = ((elapsed * 22) % (width + 160)) - 80;
        var markerY = contourY(markerX, 30, 0);
        var glow = context.createRadialGradient(markerX, markerY, 0, markerX, markerY, 24);
        glow.addColorStop(0, hexToRgba(colors.mint, 0.3));
        glow.addColorStop(1, hexToRgba(colors.mint, 0));
        context.fillStyle = glow;
        context.fillRect(markerX - 24, markerY - 24, 48, 48);
        context.globalAlpha = 0.8;
        context.fillStyle = colors.mint;
        context.fillRect(markerX - 1.5, markerY - 1.5, 3, 3);
        context.globalAlpha = 1;
      }

      // A soft scanning band moves through the field every 22 seconds.
      if (!reduceMotion) {
        var cycle = (elapsed % 22) / 22;
        var scanX = cycle * (width + 360) - 180;
        var gradient = context.createLinearGradient(scanX - 110, 0, scanX + 110, 0);
        gradient.addColorStop(0, hexToRgba(colors.mint, 0));
        gradient.addColorStop(0.5, hexToRgba(colors.mint, 0.055));
        gradient.addColorStop(1, hexToRgba(colors.mint, 0));
        context.fillStyle = gradient;
        context.fillRect(scanX - 110, 0, 220, height);
      }
    }

    function frame(now) {
      draw(now);
      if (!reduceMotion && visible) {
        raf = requestAnimationFrame(frame);
      }
    }

    function start() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      startTime = performance.now();
      if (reduceMotion) {
        draw(startTime);
      } else if (visible) {
        raf = requestAnimationFrame(frame);
      }
    }

    function onPointerMove(event) {
      if (event.pointerType === 'touch') return;
      var rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    hero.addEventListener('pointermove', onPointerMove);
    hero.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('themechange', function () {
      readColors();
      draw(performance.now());
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) {
          start();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      }, { threshold: 0.02 }).observe(hero);
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { resize(); }).observe(hero);
    }

    resize();
    start();
  }
})();
