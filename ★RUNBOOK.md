# Kanban Task Board RUNBOOK

## 概要

React / TypeScript / Vite / Tailwind CSS 製の個人用タスク管理アプリです。Supabase Auth と Supabase Database を使って、ログインユーザーごとにタスクを保存します。

## 初回セットアップ手順

```powershell
cd "C:\Users\user\Desktop\AI作業用フォルダ\02_出力（AIの生成物）\03-コード・スクリプト・ツール類\kanban-task-board"
npm install
```

`.env.local` を使う場合は、以下のみを設定します。

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

`service_role key` は入れないでください。

## 起動コマンド

```powershell
cd "C:\Users\user\Desktop\AI作業用フォルダ\02_出力（AIの生成物）\03-コード・スクリプト・ツール類\kanban-task-board"
npm run dev
```

## 動作確認方法

```powershell
cd "C:\Users\user\Desktop\AI作業用フォルダ\02_出力（AIの生成物）\03-コード・スクリプト・ツール類\kanban-task-board"
.\node_modules\.bin\tsc.cmd -b
```

公開URLで確認する場合は、以下を開きます。

```text
https://hilaude.github.io/kanban-task-board/
```

## 終了方法

開発サーバーを起動しているターミナルで `Ctrl + C` を押します。

## 注意点

- public repository のため、`.env` / `.env.local` はコミットしないでください。
- Supabase の `service_role key` はフロントエンドやGitHub Pages用Secretsに入れないでください。
- この環境では `npx tsc -b` が外部取得に行って失敗する場合があるため、ローカルの `.\node_modules\.bin\tsc.cmd -b` を使います。
- 旧フォルダは archive 側へ退避済みです。今後の作業はこの `kanban-task-board` を使います。
