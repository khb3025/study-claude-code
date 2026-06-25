/* ── Navbar: 스크롤 시 배경 전환 ── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('navbar-glass');
  } else {
    navbar.classList.remove('navbar-glass');
  }
});

/* ── 모바일 메뉴 토글 ── */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

/* 모바일 메뉴 링크 클릭 시 닫기 */
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
  });
});

/* ── Intersection Observer: 섹션 fade-in ── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));

/* ── 현재 섹션 네비 활성화 ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'text-cyan-400',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(section => sectionObserver.observe(section));

/* ── Hero 타이핑 효과 ── */
const typingTarget = document.getElementById('typing-text');
const phrases = ['백엔드 웹 개발자', 'Spring Boot 전문가', 'API 설계자'];
let phraseIdx = 0;
let charIdx = 0;
let deleting = false;

function type() {
  const current = phrases[phraseIdx];

  if (deleting) {
    typingTarget.textContent = current.substring(0, charIdx--);
    if (charIdx < 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(type, 500);
      return;
    }
  } else {
    typingTarget.textContent = current.substring(0, charIdx++);
    if (charIdx > current.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  }

  setTimeout(type, deleting ? 60 : 100);
}

type();
