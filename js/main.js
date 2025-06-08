/*************************************************************************
 * Responsive navigation + smooth scroll + parent‑menu toggle
 * main.js - * var.1.0
 * ハンバーガーメニュー制御 + スムーススクロール処理 + 親子メニュー
 *************************************************************************/

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('js-hamburger');
  const nav = document.getElementById('global-nav');
  const body = document.body;

  if (!hamburger || !nav) return;

  //utility : 現在ビューポートがモバイル幅かどうかを判定
    const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;

  // ハンバーガーメニュー開閉処理
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger?.setAttribute('aria-expanded', isOpen);
    nav.setAttribute('aria-hidden', !isOpen);
    body.classList.toggle('is-scrollLock', isOpen);

    if (isOpen) {
      nav.removeAttribute('inert');
    } else {
      const focused = document.activeElement;
      if (nav.contains(focused)) focused.blur();
      nav.setAttribute('inert', '');
    }
  };

  hamburger?.addEventListener('click', toggleMenu);

  //2. 子メニュー (parent‑menu) 開閉トグル ─ モバイル時のみ
  const initDropdownMenus = () => {
    const toggles = nav.querySelectorAll('.js-dropdown');
    if (!toggles.length) return;

    toggles.forEach(btn => {
      const parentLi = btn.closest('.is-parent');
      if (!parentLi) return;

      const handleToggle = e => {
        if (!isMobile()) return;          // PC では JS 制御しない
        e.preventDefault();

        // ── アコーディオン：開く前に他を閉じる ─────────────
        if (!parentLi.classList.contains('is-open')) {
          nav.querySelectorAll('.is-parent.is-open').forEach(openLi => {
            openLi.classList.remove('is-open');
            const openBtn = openLi.querySelector('.js-dropdown');
            if (openBtn) openBtn.setAttribute('aria-expanded', false);
          });
        }

        const isOpen = parentLi.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen);
      };

      btn.addEventListener('click', handleToggle);

      // Esc キーで閉じる
      btn.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          parentLi.classList.remove('is-open');
          btn.setAttribute('aria-expanded', false);
          btn.focus();
        }
      });
    });
  };
  initDropdownMenus();

// JS 初期化時に PC 幅なら矢印をフォーカス不可に
const setToggleTabIndex = () => {
  const toggles = document.querySelectorAll('.c-toggle');
  toggles.forEach(btn => {
    const disable = window.matchMedia('(min-width:1024px)').matches;
    btn.tabIndex = disable ? -1 : 0;
    btn.setAttribute('aria-hidden', disable);
  });
};

setToggleTabIndex();
window.addEventListener('resize', setToggleTabIndex); // 幅を跨いだときも更新

  // Safari対策付きスムーススクロール
  const smoothScrollTo = (targetY, duration = 600) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();
    const easeOutQuad = t => t * (2 - t);

    const step = currentTime => {
      const time = Math.min(1, (currentTime - startTime) / duration);
      const eased = easeOutQuad(time);
      window.scrollTo(0, startY + distance * eased);
      if (time < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const scrollToTarget = target => {
    const rect = target.getBoundingClientRect();
    const scrollY = window.pageYOffset;
    const scrollPadding = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h')
    ) || 0;
    const offsetY = scrollY + rect.top - scrollPadding;

    if (isSafari) {
      smoothScrollTo(offsetY, 600);
    } else {
      window.scrollTo({ top: offsetY, behavior: 'smooth' });
    }
  };

  // アンカーリンククリック処理
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const handleAnchor = e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      history.pushState(null, '', href);

      if (nav.classList.contains('is-open')) toggleMenu();

      requestAnimationFrame(() => scrollToTarget(target));
    };

    link.addEventListener('mousedown', e => {
      if (e.button === 0) handleAnchor(e);
    });

    link.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleAnchor(e);
    });
  });

  // 初期読み込み時のハッシュ対応
  const hash = location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      requestAnimationFrame(() => scrollToTarget(target));
    }
  }

  // PC/SP幅の切り替えに応じてナビ状態調整
  window.matchMedia('(min-width: 768px)').addEventListener('change', e => {
    if (e.matches) {
      nav.removeAttribute('aria-hidden');
      nav.removeAttribute('inert');
    } else {
      if (!nav.classList.contains('is-open')) {
        nav.setAttribute('aria-hidden', 'true');
        nav.setAttribute('inert', '');
      }
    }
  });

  if (window.matchMedia('(min-width: 768px)').matches) {
    nav.removeAttribute('aria-hidden');
    nav.removeAttribute('inert');
  }
});