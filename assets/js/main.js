// Site interactions
document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll reveal -----------------------------------------------------
  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.home-section, .service-card, .featured-card, .project-card, .blog-card, .skill-card, .about-section, .contact-section'
    ).forEach(function (el) {
      el.classList.add('fade-in-element');
      el.addEventListener('animationend', function () {
        // Drop the reveal classes so hover transforms are no longer overridden
        // by the finished animation's fill mode.
        el.classList.remove('fade-in-element', 'fade-in-up');
      }, { once: true });
      observer.observe(el);
    });
  }

  // --- Smooth scrolling for in-page anchors ------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- Mobile navigation -------------------------------------------------
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.querySelector('.nav-menu');
  var body = document.body;

  function setMenu(open) {
    if (!navToggle || !navMenu) return;
    navToggle.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.classList.toggle('nav-open', open);
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(!navMenu.classList.contains('active'));
    });

    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        setMenu(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        setMenu(false);
        navToggle.focus();
      }
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980 && navMenu.classList.contains('active')) {
        setMenu(false);
      }
    });
  }

  // --- Header state ------------------------------------------------------
  var header = document.querySelector('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
});
