# Upload Ready Sample

このフォルダだけを Vercel / Netlify / Cloudflare Pages / GitHub Pages などにアップロードすれば、最低限の画面確認ができます。

## Entry

- `index.html` から `00_hub.html` に自動遷移します。
- 直接開く場合は `00_hub.html` を開いてください。

## Sample Login

- パスワード: `demo`
- 履歴メール: `demo-a@example.invalid`

## Notes

- Google Sheets、Apps Script、Drive、メール送信には接続しません。
- データは各ブラウザの `localStorage` に保存されます。
- 複数人で同じデータを共有する仕組みは含めていません。

## Vercel Example

- Framework Preset: `Other`
- Build Command: 空欄
- Output Directory: `.`
- Root Directory: この `upload-ready` フォルダ
