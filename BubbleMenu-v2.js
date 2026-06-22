/**
 * BubbleMenu — vanilla JS port of the React Bits BubbleMenu component.
 * Requires GSAP (loaded via CDN or bundler before this script).
 *
 * Mobile  (<900px): full-screen pill overlay with staggered bubble animation.
 * Desktop (≥900px): sliding side panel from the right.
 */
(function () {
  function initBubbleMenu(config) {
    config = Object.assign({
      menuBg: '#ffffff',
      menuContentColor: '#111111',
      useFixedPosition: true,
      animationEase: 'back.out(1.5)',
      animationDuration: 0.5,
      staggerDelay: 0.12
    }, config || {});

    var existingNav = document.querySelector('nav');
    if (!existingNav) return;

    // Extract logo href + src from existing nav
    var logoAnchor = existingNav.querySelector('.nav-logo');
    var logoHref = logoAnchor ? logoAnchor.getAttribute('href') : '#';
    var logoImg = existingNav.querySelector('.nav-logo img');
    var logoSrc = logoImg ? logoImg.getAttribute('src') : '';
    var logoAlt = logoImg ? logoImg.getAttribute('alt') : '';

    // Extract nav items from existing nav
    var navLinks = existingNav.querySelectorAll('.nav-links a');
    var rotations = [-8, 8, -8, 8, -8];
    var hoverColors = [
      { bgColor: '#3b82f6', textColor: '#ffffff' },
      { bgColor: '#10b981', textColor: '#ffffff' },
      { bgColor: '#f59e0b', textColor: '#ffffff' },
      { bgColor: '#ef4444', textColor: '#ffffff' },
      { bgColor: '#8b5cf6', textColor: '#ffffff' }
    ];
    var items = Array.prototype.map.call(navLinks, function (a, i) {
      return {
        label: a.textContent.trim(),
        href: a.getAttribute('href'),
        ariaLabel: a.textContent.trim(),
        rotation: rotations[i] !== undefined ? rotations[i] : 0,
        hoverStyles: hoverColors[i] || { bgColor: '#f3f4f6', textColor: '#111' }
      };
    });

    existingNav.remove();

    var posClass = config.useFixedPosition ? 'fixed' : 'absolute';

    // ── Nav bar ──────────────────────────────────────────────
    var nav = document.createElement('nav');
    nav.className = 'bubble-menu ' + posClass;
    nav.setAttribute('aria-label', 'Main navigation');

    var logoBubble = document.createElement('a');
    logoBubble.href = logoHref;
    logoBubble.className = 'bubble logo-bubble';
    logoBubble.setAttribute('aria-label', 'Logo');
    logoBubble.style.background = config.menuBg;
    logoBubble.innerHTML = '<span class="logo-content"><img src="' + logoSrc + '" alt="' + logoAlt + '" class="bubble-logo" /></span>';
    nav.appendChild(logoBubble);

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'bubble toggle-bubble menu-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation');
    toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn.style.background = config.menuBg;
    toggleBtn.innerHTML =
      '<span class="menu-line" style="background:' + config.menuContentColor + '"></span>' +
      '<span class="menu-line" style="background:' + config.menuContentColor + '"></span>';
    nav.appendChild(toggleBtn);

    // ── Overlay ──────────────────────────────────────────────
    var overlay = document.createElement('div');
    overlay.className = 'bubble-menu-items ' + posClass;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.display = 'none';

    var ul = document.createElement('ul');
    ul.className = 'pill-list';
    ul.setAttribute('role', 'menu');
    ul.setAttribute('aria-label', 'Menu links');

    var pillEls = [];
    var labelEls = [];

    items.forEach(function (item, idx) {
      var li = document.createElement('li');
      li.className = 'pill-col';
      li.setAttribute('role', 'none');

      var a = document.createElement('a');
      a.href = item.href;
      a.className = 'pill-link';
      a.setAttribute('role', 'menuitem');
      a.setAttribute('aria-label', item.ariaLabel || item.label);
      a.style.setProperty('--item-rot', (item.rotation || 0) + 'deg');
      a.style.setProperty('--pill-bg', config.menuBg);
      a.style.setProperty('--pill-color', config.menuContentColor);
      a.style.setProperty('--hover-bg', item.hoverStyles.bgColor || '#f3f4f6');
      a.style.setProperty('--hover-color', item.hoverStyles.textColor || config.menuContentColor);

      var span = document.createElement('span');
      span.className = 'pill-label';
      span.textContent = item.label;

      a.appendChild(span);
      li.appendChild(a);
      ul.appendChild(li);

      pillEls.push(a);
      labelEls.push(span);
    });

    overlay.appendChild(ul);

    var backdrop = document.createElement('div');
    backdrop.className = 'bubble-menu-backdrop';
    backdrop.style.display = 'none';

    var body = document.body;
    body.insertBefore(overlay, body.firstChild);
    body.insertBefore(backdrop, body.firstChild);
    body.insertBefore(nav, body.firstChild);

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-pressed', 'true');
      overlay.setAttribute('aria-hidden', 'false');

      gsap.set(backdrop, { display: 'block', autoAlpha: 0 });
      gsap.to(backdrop, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' });

      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf(pillEls.concat(labelEls));
      gsap.set(pillEls, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labelEls, { y: 24, autoAlpha: 0 });

      pillEls.forEach(function (pill, i) {
        var delay = i * config.staggerDelay + gsap.utils.random(-0.05, 0.05);
        var tl = gsap.timeline({ delay: delay });
        tl.to(pill, { scale: 1, duration: config.animationDuration, ease: config.animationEase });
        if (labelEls[i]) {
          tl.to(labelEls[i], {
            y: 0, autoAlpha: 1,
            duration: config.animationDuration,
            ease: 'power3.out'
          }, '-=' + (config.animationDuration * 0.9));
        }
      });
    }

    function closeMenu() {
      isOpen = false;
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-pressed', 'false');
      overlay.setAttribute('aria-hidden', 'true');

      gsap.killTweensOf(pillEls.concat(labelEls));
      gsap.to(labelEls, { y: 24, autoAlpha: 0, duration: 0.2, ease: 'power3.in' });
      gsap.to(backdrop, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
      gsap.to(pillEls, {
        scale: 0, duration: 0.2, ease: 'power3.in',
        onComplete: function () {
          gsap.set(overlay, { display: 'none' });
          gsap.set(backdrop, { display: 'none' });
        }
      });
    }

    toggleBtn.addEventListener('click', function () {
      if (isOpen) closeMenu(); else openMenu();
    });

    pillEls.forEach(function (pill) {
      pill.addEventListener('click', function () { closeMenu(); });
    });

    window.addEventListener('resize', function () {
      if (!isOpen) return;
      var isDesktop = window.innerWidth >= 900;
      pillEls.forEach(function (pill, i) {
        gsap.set(pill, { rotation: isDesktop ? (items[i].rotation || 0) : 0 });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initBubbleMenu(); });
  } else {
    initBubbleMenu();
  }

  window.initBubbleMenu = initBubbleMenu;
})();
