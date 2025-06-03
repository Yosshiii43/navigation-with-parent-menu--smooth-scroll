# navigation-with-parent-menu- smooth-scroll

## ヘッダーのカスタマイズ

`scss/foundation/_variables.scss` で高さと挙動を切り替えられます。

| 変数            | 役割                      | デフォルト  |
|----------------|---------------------------|-----------|
| `$header-h`    | ヘッダーの高さ              | `64px`    |
| `$header-mode` | `fixed` か `sticky` を指定 | `sticky`  |

// 例: 高さ 72px の固定ヘッダーに切り替え
$header-h   : 72px;
$header-mode: fixed;

これらは
`scss/foundation/_base.scss`
`scss/object/layout/_header.scss`
に反映されます。


#### 本番公開時の手順
1. Sass Watcher で `style.min.css` が生成されていることを確認  
2. `index.html` の `<link>` を `css/style.min.css` に切り替え  
3. `css/style.css` と `css/style.css.map` はサーバにアップロードしない# parent-navigation-smooth-scroll
# navigation-with-parent-menu--smooth-scroll
