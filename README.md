# navigation-with-parent-menu--smooth-scroll

親子メニューに対応した **レスポンシブ・ナビゲーション** テンプレートです。  
- **SP 幅**：ハンバーガー + サイドパネル（排他アコーディオン）  
- **PC 幅**：横並びメニュー + ドロップダウン  
さらに ― Safari の「逆スクロール」や `Tab` 戻り問題を解消し、固定ヘッダーでも #アンカーへスムースに移動します。

---

## Features
- ハンバーガーメニュー（`aria-expanded` 更新・`inert` 制御付き）
- 親子メニュー  
  - **PC** … hover / focus、Esc & Tab 終端で自動クローズ  
  - **SP** … `.c-toggle` の Enter / Space / Tap で排他アコーディオン
- 固定ヘッダーでもズレないスムーススクロール（Safari 専用 polyfill）
- 変数 2 つで *高さ* と *fixed / sticky* を切替
- タブレット幅 *768–1023 px* は **SP モード** と同じ挙動
- Sass + PostCSS（Autoprefixer）ビルド

---

## Quick Start

```bash
git clone https://github.com/Yosshiii43/navigation-with-parent-menu--smooth-scroll
cd repo
npm install        # Sass + PostCSS をインストール
npm run dev        # style.min.css を自動生成し watch
```

---

## Customization

### ヘッダー高さ / モード

scss/foundation/_variables.scss

| 変数            | 役割                      | デフォルト  |
|----------------|---------------------------|-----------|
| `$header-h`    | ヘッダーの高さ              | `64px`    |
| `$header-mode` | `fixed` か `sticky` を指定 | `fixed `  |

// 例: 高さ 72px のstickyヘッダーに切り替えたい場合

```
$header-h   : 72px;
$header-mode: sticky;
```

Safari 注意：sticky + Tab で逆スクロールが起きるため、
本番では fixed 推奨（JS 側で追加対策済み）。

これらは
`scss/foundation/_base.scss`
`scss/object/layout/_header.scss`
に反映されます。

---

### ハンバーガーの線

scss/object/component/_hamburger.scss

```
.c-hamburger {
  --bar-h: 2px;   // 線の太さ
  --gap : 6px;    // 線間の隙間
}
```

---

### ブレークポイント
scss/foundation/_mq.scss

| 名称     | min-width  | 挙動                        |
|---------|------------|-----------------------------|
| tab     | 768px      | SPモード（ハンバーガーメニュー） |
| pc      | 1024px     | PCモード（ドロップダウンメニュー）|

tabをpcに合わせたい時は、
main.jsの
```
const mqPC      = window.matchMedia('(min-width: 1024px)'); // PC = 1024px↑
```
のmin-widthを768pxに変更する。

---

## Keyboard Flow (PC)

| 操作             | 挙動                          |
|-----------------|-------------------------------|
|Tab              | 親リンク → 初回で子メニュー展開    |
|Esc (親/子)       | 子メニューを閉じ 隣の親へフォーカス |
|Tab (子末尾)      | 子メニュー閉じ 次メニューへ        |
|Shift+Tab (子先頭)| 子メニュー閉じ 親へ戻る           |

---

## Browser Support

| Chrome | Firefox | Safari | Edge | IE  |
|--------|---------|--------|------|---- |
| 95+    | 91+     | 15+    | 95+  | ❌  |

---

## LIcense

MIT © 2025  Yosshiii