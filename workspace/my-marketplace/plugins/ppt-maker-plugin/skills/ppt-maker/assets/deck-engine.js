/* ppt-maker deck-engine.js
   모든 슬라이드 덱이 공통으로 불러오는 내비게이션/인터랙션 엔진.
   기능: 방향키 슬라이드 이동, F5 전체화면, 슬라이드 번호 매기기, 다크/라이트 테마 토글.
   PDF 변환 시(scripts/export-pdf.js)에는 이 스크립트를 실행하지 않고 body.print-mode CSS만으로 렌더링한다. */

(function () {
  function initDeck() {
    var slides = Array.from(document.querySelectorAll('.slide'));
    if (slides.length === 0) return;

    var current = 0;
    var pageIndicator = document.getElementById('pageIndicator');
    var progress = document.getElementById('progress');

    function updateIndicators() {
      if (pageIndicator) pageIndicator.textContent = (current + 1) + ' / ' + slides.length;
      if (progress) progress.style.width = ((current + 1) / slides.length * 100) + '%';
      var pageNum = slides[current].querySelector('.page-num');
      if (!pageNum) {
        pageNum = document.createElement('div');
        pageNum.className = 'page-num';
        slides[current].appendChild(pageNum);
      }
      pageNum.textContent = (current + 1) + ' / ' + slides.length;
    }

    function goTo(index) {
      if (index < 0 || index >= slides.length) return;
      slides[current].classList.remove('active');
      current = index;
      slides[current].classList.add('active');
      updateIndicators();
    }

    // 방향키로 슬라이드 이동 (←/→, PageUp/PageDown, Space로 다음)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { goTo(current + 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { goTo(current - 1); e.preventDefault(); }
      else if (e.key === 'F5') { toggleFullscreen(); e.preventDefault(); }
      else if (e.key === 'Home') { goTo(0); }
      else if (e.key === 'End') { goTo(slides.length - 1); }
    });

    // F5 전체화면 토글 (브라우저 새로고침 기본 동작을 막고 Fullscreen API 사용)
    function toggleFullscreen() {
      var el = document.documentElement;
      if (!document.fullscreenElement) {
        (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
      }
    }
    window.toggleFullscreen = toggleFullscreen;

    window.togglePptTheme = function () {
      var root = document.documentElement;
      root.setAttribute('data-theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    };

    // 반응형 프리뷰 스케일 (1280x720 좌표계를 창 크기에 맞춰 축소/확대)
    function updateScale() {
      var ratio = Math.min(window.innerWidth / 1280, window.innerHeight / 720, 1) * 0.92;
      document.documentElement.style.setProperty('--preview-scale', ratio);
      var fsRatio = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
      document.documentElement.style.setProperty('--fullscreen-scale', fsRatio);
    }
    window.addEventListener('resize', updateScale);
    updateScale();

    // .fragment 클릭 시 순차 등장
    var fragments = Array.from(document.querySelectorAll('.fragment'))
      .sort(function (a, b) { return (Number(a.dataset.fragmentIndex) || 0) - (Number(b.dataset.fragmentIndex) || 0); });
    var revealed = 0;
    document.body.addEventListener('click', function (e) {
      if (e.target.closest('.theme-toggle, .fullscreen-toggle')) return;
      if (revealed < fragments.length) {
        fragments[revealed].classList.add('visible');
        revealed++;
      }
    });

    updateIndicators();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeck);
  } else {
    initDeck();
  }
})();
