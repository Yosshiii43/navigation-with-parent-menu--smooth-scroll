/*************************************************************************
 * main.js – ver.1.1
 *
 *   1)  ハンバーガー開閉（SP）  …… サイドパネル表示／非表示
 *   2)  スムーススクロール      …… #アンカーへふわっと移動
 *   3-A)PC   : フォーカスで子メニュー表示・Esc/Tab で閉じる
 *   3-B)SP   : .c-toggle(▼) を Enter/Space/Click でアコーディオン
 *   4)  リサイズ時の再初期化    …… PC↔SP を行った時のバグ防止
 *************************************************************************/

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------ */
  /* 0. 変数と便利関数                                                  */
  /* ------------------------------------------------------------------ */
  // ─ コンポーネント取得
  const header    = document.getElementById('js-header');
  const hamburger = document.getElementById('js-hamburger');  // ≡ ボタン
  const nav       = document.getElementById('global-nav');     // <nav>
  const body      = document.body;
  if (!nav || !hamburger) return;   // nav が無いページでは以降をスキップ

  const getHeaderHeight = () => header ? header.offsetHeight : 0;

  // ユーティリティ
  const syncHeaderVar = () => { //「CSS 変数 --header-h をヘッダーの実寸で同期する」関数。
    document.documentElement.style.setProperty('--header-h', `${getHeaderHeight()}px`);
  };
  syncHeaderVar();                         // 初期設定
  window.addEventListener('resize', syncHeaderVar); //ブラウザのリサイズ時に毎回実行

  
  // ─ 環境判定
  const mqPC      = window.matchMedia('(min-width: 1024px)'); // PC = 1024px↑
  const isPC = () => mqPC.matches;    // true/false 返す関数
  const isSP = () => !mqPC.matches;   // 同上

  // ─ 子メニューを「全部」閉じる共通関数
  function closeAllSubMenus() {
    nav.querySelectorAll('.p-nav__item.is-parent').forEach(li =>
      li.classList.remove('is-open')
    );
    // ▼アイコンの ARIA もリセット
    nav.querySelectorAll('.c-toggle').forEach(tg =>
      tg.setAttribute('aria-expanded', 'false')
    );
  }

  // ─ PC では ▼ボタンを Tab で飛ばさないための tabindex 設定
  function updateToggleTabindex() {
    nav.querySelectorAll('.c-toggle').forEach(tg =>
      tg.setAttribute('tabindex', isPC() ? '-1' : '0')
    );
  }

  /* ------------------------------------------------------------------ */
  /* 1. ハンバーガーメニュー（SP）                                       */
  /* ------------------------------------------------------------------ */
  // inert を使って「見えない時はフォーカスを当てられない」ようにする
  function setInert(state) {
    if (state) {
      nav.setAttribute('inert', '');
      nav.setAttribute('aria-hidden', 'true');
    } else {
      nav.removeAttribute('inert');
      nav.setAttribute('aria-hidden', 'false');
    }
  }

  // ≡ を押したときの開閉ロジック
  function toggleMenu() {
    const isOpen = nav.classList.toggle('is-open');         // パネル開閉
    hamburger.setAttribute('aria-expanded', isOpen);
    body.classList.toggle('is-scrollLock', isOpen);         // 背景スクロール禁止

    if (!isOpen) closeAllSubMenus();                       // 閉じる時は子も閉じる
    setInert(isSP() && !isOpen);                           // inert 付け直し
  }
  hamburger.addEventListener('click', toggleMenu);

  /* ------------------------------------------------------------------ */
  /* 2. スムーススクロール (#リンク)                                     */
  /* ------------------------------------------------------------------ */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const smoothScrollTo = (targetY, duration = 350) => { //速度をここで管理
    if (reduceMotion) {
      window.scrollTo(0, targetY);
      return;
    }
    const startY  = window.pageYOffset;
    const dist    = targetY - startY;
    const startT  = performance.now();
    const easeOut = t => t * (2 - t);       // お好みで変更可

    const step = now => {
      const t = Math.min(1, (now - startT) / duration);
      window.scrollTo(0, startY + dist * easeOut(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const scrollToTarget = target => {
    const headerH = getHeaderHeight();   // ←動的に取得
    const offsetY = target.getBoundingClientRect().top + window.pageYOffset - headerH;
    smoothScrollTo(offsetY);
  };

  // アンカーリンク（ページ内）クリック：スムーススクロール
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');     // "#first" 等
      e.preventDefault();                         // ★常に標準ジャンプ抑止

      if (!href || href === '#') return;          // ダミー "#" はここで終了

      const target = document.querySelector(href);
      if (!target) return;                        // 要素が無ければ終了

      history.pushState(null, '', href);          // URL の # を更新

      // ハンバーガーが開いていたら閉じる (nav がある時のみ)
      const nav = document.getElementById('global-nav');
      if (nav && nav.classList.contains('is-open')) toggleMenu();

      // 次フレームでスムーススクロール
      requestAnimationFrame(() => scrollToTarget(target));
    });
  });

  /* ------------------------------------------------------------------ */
  /* 3. PC 幅：フォーカスで開き Esc/Tab で閉じる                        */
  /* ------------------------------------------------------------------ */
  function attachPCFocusHandlers() {
    nav.querySelectorAll('.p-nav__item.is-parent').forEach(parentLi => {
      if (parentLi.dataset.pcBound) return;           // 二重登録防止
      parentLi.dataset.pcBound = 'true';

      const parentLink = parentLi.querySelector('.p-nav__link');
      const childLinks = [...parentLi.querySelectorAll('.p-nav__sub a')];

      // 親にフォーカス → その子メニューを開き、他を閉じる
      parentLink.addEventListener('focus', () => {
        if (!isPC()) return;
        closeAllSubMenus();
        parentLi.classList.add('is-open');
      });

      // 親リンク Esc → 閉じる
      parentLink.addEventListener('keydown', e => {
        if (isPC() && e.key === 'Escape') {
          parentLi.classList.remove('is-open');
          //次のトップレベルへフォーカス 
          const topLinks = [...nav.querySelectorAll('.p-nav__link')];
          const curIndex = topLinks.indexOf(parentLink);
          const next     = topLinks[(curIndex + 1) % topLinks.length];
          next.focus();
        }
      });

      // 子リンク: Esc or 最後のTab で閉じる
      childLinks.forEach((link, idx) => {
        link.addEventListener('keydown', e => {
          if (!isPC()) return;

          if (e.key === 'Escape') {
            e.preventDefault();
            parentLi.classList.remove('is-open');
            //次のトップレベルへフォーカス
            const topLinks = [...nav.querySelectorAll('.p-nav__link')];
            const curIndex = topLinks.indexOf(parentLink);
            const next     = topLinks[(curIndex + 1) % topLinks.length]; // 最後なら先頭
            next.focus();                  // フォーカス移動で focus-within 解除
            return;
          }
          // 最後のリンクで Tab → 次のメニューへ
          if (e.key === 'Tab' && !e.shiftKey && idx === childLinks.length - 1) {
            parentLi.classList.remove('is-open');
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. SP 幅：▼ボタン (.c-toggle) アコーディオン                       */
  /* ------------------------------------------------------------------ */
  function accordToggle(toggle) {
    const parentLi = toggle.closest('.p-nav__item');
    const isOpen   = parentLi.classList.contains('is-open');

    closeAllSubMenus();                       // まず全部閉じる（排他）
    if (!isOpen) {
      parentLi.classList.add('is-open');      // 自分だけ開く
      toggle.setAttribute('aria-expanded', 'true');
    }
  }

  function attachSPAccordion() {
    nav.querySelectorAll('.c-toggle').forEach(toggle => {
      // 毎回 tabindex を上書き（幅変更直後も確実に更新）
      toggle.setAttribute('tabindex', isPC() ? '-1' : '0');

      if (toggle.dataset.spBound) return;     // 二重登録防止
      toggle.dataset.spBound = 'true';

      toggle.addEventListener('click', () => {
        if (isPC()) return;                   // PC 幅では無効
        accordToggle(toggle);
      });

      toggle.addEventListener('keydown', e => {
        if (isPC()) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();                 // Space のページスクロール防止
          accordToggle(toggle);
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 5. 幅切替時の再初期化                                              */
  /* ------------------------------------------------------------------ */
  function pcSpReInit() {
    closeAllSubMenus();                               // 子メニュー全閉じ
    nav.classList.remove('is-open');                  // ハンバーガーパネルも閉じる
    hamburger.setAttribute('aria-expanded', 'false'); // ★ハンバーガー初期化
    body.classList.remove('is-scrollLock');           // ★SPロック解除
    setInert(isSP());              // inert 付け直し

    updateToggleTabindex();        // ▼ボタンの tabindex 切替
    attachPCFocusHandlers();       // ハンドラ重複しないよう flags 済み
    attachSPAccordion();
  }

  /* ------------------------------------------------------------------ */
  /* 初期化 (ここが実質の main 関数)                                     */
  /* ------------------------------------------------------------------ */
  updateToggleTabindex();       // ① まず tabindex を確定
  attachPCFocusHandlers();      // ② PC 用ハンドラ登録
  attachSPAccordion();          // ③ SP 用ハンドラ登録
  mqPC.addEventListener('change', pcSpReInit); // 幅変更ウォッチ
  setInert(isSP());             // ④ inert 付ける（初期パネルは閉じている）
});