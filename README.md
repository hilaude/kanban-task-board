# Kanban Task Board

React / TypeScript / Vite / Tailwind CSSで作成した、個人利用向けのシンプルなタスク管理アプリです。
カンバンビューとリストビューを切り替えながら、タスクの追加、編集、削除、複製、完了タスクのアーカイブ管理ができます。

## 公開URL

GitHub Pagesで公開する場合のURLです。

https://hilaude.github.io/kanban-task-board/

## 主な機能

- カンバンビュー
- リストビュー
- ビュー切り替え
- タスク追加、編集、削除
- タスク複製
- 完了タスク限定のアーカイブ
- アーカイブ済みタスクの表示、復元、削除
- タスク名検索
- 優先度、カテゴリでのフィルター
- リストビューのソート
- localStorageへの自動保存

## 使用技術

- React
- TypeScript
- Vite
- Tailwind CSS
- localStorage

## セットアップ

```bash
npm install
```

## 起動方法

```bash
npm run dev
```

表示されたURLをブラウザで開いてください。

## ビルド方法

```bash
npm run build
```

ビルド後の確認をする場合は、以下を実行します。

```bash
npm run preview
```

## GitHub Pagesへの公開

`main` または `master` ブランチにpushすると、GitHub Actionsで自動ビルドされ、GitHub Pagesへ公開されます。
GitHub側の Pages 設定で、公開元は `GitHub Actions` を選択してください。

## データ保存方式

データはブラウザのlocalStorageに保存されます。
同じブラウザではリロード後もタスクが残りますが、別端末や別ブラウザとの同期はまだできません。

## Supabase同期の予定

今後、Supabase Freeを使ってブラウザ間・デバイス間同期を追加する予定です。
その場合も、`service_role` keyはフロントエンドに入れず、Viteの公開環境変数にはSupabase URLとanon keyだけを設定します。
まずはログインありの個人利用を前提に、タスクを自分のユーザーIDに紐づけて保存する方針です。

## 今後の追加候補

- Supabaseを使ったデータ同期
- JSONバックアップ / 復元
- CSVエクスポート
- タスク詳細画面
- カンバン列内の並び替え
- 期限切れ件数の集計表示

## 注意事項

- 現時点では自分用のMVPです。
- ログイン機能やバックエンド連携はまだありません。
- localStorageを削除すると保存済みタスクも消えます。
- `.env` や `.env.local` はGitHubにコミットしません。
