# Kanban Task Board

React / TypeScript / Vite / Tailwind CSSで作った、自分用のシンプルなタスク管理アプリです。
カンバンビューとリストビューを切り替えながら、タスクの追加、編集、削除、複製、完了タスクのアーカイブ管理ができます。

## 公開URL

GitHub Pages:

https://hilaude.github.io/kanban-task-board/

## 主な機能

- Supabase Authによるメール/パスワードログイン
- Supabase Freeを使ったブラウザ間・端末間同期
- カンバンビュー
- リストビュー
- ビュー切り替え
- タスク追加、編集、削除
- タスク複製
- カード色の選択
- 完了タスク限定のアーカイブ
- アーカイブ済みタスクの表示、復元、削除
- タスク名検索
- 優先度、カテゴリでのフィルター
- リストビューのソート

## 使用技術

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase Auth
- Supabase Database
- GitHub Pages
- GitHub Actions

## セットアップ

```bash
npm install
```

`.env.local` を作成し、Supabaseの接続情報を設定します。

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

`service_role` keyはフロントエンドに入れないでください。

## 起動方法

```bash
npm run dev
```

## ビルド方法

```bash
npm run build
```

ビルド後の確認:

```bash
npm run preview
```

## Supabase設定

Supabase SQL Editorで `supabase/schema.sql` を実行してください。

このアプリは `tasks.user_id` と `auth.uid()` をRLSで照合し、ログイン中の本人のタスクだけを読み書きします。

## GitHub Pages公開

`main` ブランチにpushすると、GitHub Actionsで自動ビルドされ、GitHub Pagesへ公開されます。

GitHubのリポジトリ設定で、以下のSecretsを登録してください。

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

GitHub PagesのSourceは `GitHub Actions` を選択してください。

ローカルから反映する場合:

```bash
git remote add origin https://github.com/hilaude/kanban-task-board.git
git branch -M main
git push -u origin main
```

## データ保存方式

ログイン後のタスクはSupabaseの `tasks` テーブルに保存されます。
ログイン後はSupabase上のデータを正として扱います。

## 注意事項

- このアプリは自分1人で使う前提です。
- Realtime購読はまだ入れていません。
- GitHub Pagesで公開する場合、Supabase URLとanon keyは公開されますが、RLSで本人のデータだけ扱えるようにします。
- `.env` と `.env.local` はGitHubにコミットしません。
- `service_role` keyは絶対にフロントエンドやGitHub SecretsのPagesビルド用途に入れないでください。

## 今後の追加候補

- Realtime同期
- JSONバックアップ / 復元
- CSVエクスポート
- タスク詳細画面
- カンバン列内の並び替え
