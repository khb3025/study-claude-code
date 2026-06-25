document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initHamburgerMenu();
  initScrollAnimation();
  initNavHighlight();
});

function initDarkMode() {
  const toggleBtn = document.getElementById('darkToggle');
  const html = document.documentElement;

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;

  if (isDark) {
    html.classList.add('dark');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }

  toggleBtn.addEventListener('click', () => {
    const darkMode = html.classList.toggle('dark');
    toggleBtn.innerHTML = darkMode
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  });
}

function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  function openMenu() {
    mobileMenu.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    hamburgerBtn.innerHTML = '<i class="fas fa-xmark text-xl"></i>';
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    mobileMenu.classList.add('hidden');
    document.body.style.overflow = '';
    hamburgerBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('hidden');
    isOpen ? closeMenu() : openMenu();
  });

  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

function initScrollAnimation() {
  const targets = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px',
  });

  targets.forEach(target => observer.observe(target));
}

function initNavHighlight() {
  const header = document.getElementById('mainHeader');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[data-section], #mobileMenu a[data-section]');

  function updateActiveLink(activeId) {
    navLinks.forEach(link => {
      if (link.getAttribute('data-section') === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveLink(entry.target.getAttribute('id'));
      }
    });
  }, {
    rootMargin: `-${header.offsetHeight}px 0px -55% 0px`,
    threshold: 0,
  });

  sections.forEach(section => sectionObserver.observe(section));

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('shadow-md', 'bg-white/95', 'dark:bg-gray-900/95', 'backdrop-blur-sm');
    } else {
      header.classList.remove('shadow-md', 'bg-white/95', 'dark:bg-gray-900/95', 'backdrop-blur-sm');
    }
  }, { passive: true });
}
