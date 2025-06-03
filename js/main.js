/*************************************************************************
 * Responsive navigation + smooth scroll + parent‑menu toggle
 * 2025.06  |  scroll‑restoration fix added
 * 2025.06  |  Menu parenting (mobile toggle, PC hover)
 * 2025.06  |  Accordion for mobile: one submenu open at a time
 *************************************************************************/

// ─── ① Stop browser’s automatic scroll restoration ───────────────
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

// ─── ② Navigation, dropdown, & smooth-scroll handler ─────────────
(() => {
  const hamburger = document.getElementById("js-hamburger");
  const nav = document.getElementById("global-nav");
  if (!hamburger || !nav) return;

  /* -------------------------------------------------------------
     utility : 現在ビューポートがモバイル幅かどうかを判定
  ----------------------------------------------------------------*/
  const isMobile = () => window.matchMedia("(max-width: 1023px)").matches;

  /* -------------------------------------------------------------
     1. ハンバーガー開閉
  ----------------------------------------------------------------*/
  const toggleMenu = () => {
    const isOpen = nav.classList.toggle("is-open"); // true = 開いた
    hamburger.setAttribute("aria-expanded", isOpen);
    nav.setAttribute("aria-hidden", !isOpen);
    document.body.classList.toggle("is-scrollLock", isOpen);

    // メニューを閉じるときは子メニューも一括で閉じる
    if (!isOpen) {
      nav.querySelectorAll(".is-open").forEach(el => el.classList.remove("is-open"));
      nav.querySelectorAll(".js-dropdown[aria-expanded='true']")
         .forEach(btn => btn.setAttribute("aria-expanded", false));
    }
  };
  hamburger.addEventListener("click", toggleMenu);

/* -------------------------------------------------------------
     2. 子メニュー (parent‑menu) 開閉トグル ─ モバイル時のみ
        - 開く前に“他の開いている子メニュー”を閉じてアコーディオン化
  --------------------------------------------------------------*/
  const initDropdownMenus = () => {
    const toggles = nav.querySelectorAll(".js-dropdown");
    if (!toggles.length) return;

    toggles.forEach(btn => {
      const parentLi = btn.closest(".is-parent");
      if (!parentLi) return;

      const handleToggle = e => {
        if (!isMobile()) return;          // PC では JS 制御しない
        e.preventDefault();

        // ── アコーディオン：開く前に他を閉じる ─────────────
        if (!parentLi.classList.contains("is-open")) {
          nav.querySelectorAll(".is-parent.is-open").forEach(openLi => {
            openLi.classList.remove("is-open");
            const openBtn = openLi.querySelector(".js-dropdown");
            if (openBtn) openBtn.setAttribute("aria-expanded", false);
          });
        }

        const isOpen = parentLi.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", isOpen);
      };

      btn.addEventListener("click", handleToggle);

      // Esc キーで閉じる
      btn.addEventListener("keydown", e => {
        if (e.key === "Escape") {
          parentLi.classList.remove("is-open");
          btn.setAttribute("aria-expanded", false);
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


  /* -------------------------------------------------------------
     3. ページ内スムーススクロール
  ----------------------------------------------------------------*/
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const targetID = link.getAttribute("href");
      const target = targetID === "#" ? document.documentElement
                                       : document.querySelector(targetID);
      if (!target) return;

      e.preventDefault();
      history.replaceState(null, "", targetID);

      if (nav.classList.contains("is-open")) toggleMenu();

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();

// ─── ③ Reload / back-forward 時に hash 位置を補正 ─────────────
document.addEventListener("DOMContentLoaded", () => {
  const hash = location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      // ❶ 一時的に scroll-behavior を auto に設定して瞬時移動
      const htmlEl = document.documentElement;
      const prevBehavior = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = "auto";

      target.scrollIntoView({ block: "start" }); // ← アニメなしで補正

      // ❷ 元に戻して以降のクリックは smooth
      htmlEl.style.scrollBehavior = prevBehavior;
    }
  }
});