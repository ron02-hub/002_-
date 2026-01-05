# データベース設定クイックスタート

## 📋 概要

マーケティング分析レポートを生成するには、データベース接続が必要です。

## 🚀 クイックセットアップ

### オプション1: Supabaseを使用（推奨・無料プランあり）

1. **Supabaseアカウントの作成**
   - [https://supabase.com](https://supabase.com) にアクセス
   - アカウントを作成（GitHubアカウントでログイン可能）

2. **プロジェクトの作成**
   - ダッシュボードで「New Project」をクリック
   - プロジェクト名を入力（例: `ev-survey`）
   - データベースパスワードを設定（重要：後で使用します）
   - リージョンを選択（`Tokyo`推奨）
   - 「Create new project」をクリック

3. **接続情報の取得**
   - プロジェクトが作成されたら、「Settings」→「Database」に移動
   - 「Connection string」セクションで「URI」を選択
   - 表示された接続文字列をコピー
   - 形式: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

4. **環境変数の設定**
   - `src/.env`ファイルを作成（存在しない場合）
   - 以下の内容を追加：
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```
   - `[PASSWORD]`は、プロジェクト作成時に設定したパスワードに置き換えてください
   - `[PROJECT_REF]`と`[REGION]`は、Supabaseから取得した値に置き換えてください

5. **データベースマイグレーション**
   ```bash
   cd src
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

6. **擬似データの生成**
   ```bash
   npm run db:mock:200
   ```

7. **マーケティング分析レポートの生成**
   ```bash
   npm run marketing:report
   ```

### オプション2: ローカルPostgreSQLを使用

1. **PostgreSQLのインストール**
   ```bash
   # macOS (Homebrew)
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. **データベースの作成**
   ```bash
   createdb ev_survey
   ```

3. **環境変数の設定**
   - `src/.env`ファイルを作成
   - 以下の内容を追加：
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ev_survey"
   ```
   - `password`は、PostgreSQLのパスワードに置き換えてください

4. **データベースマイグレーション**
   ```bash
   cd src
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **擬似データの生成**
   ```bash
   npm run db:mock:200
   ```

6. **マーケティング分析レポートの生成**
   ```bash
   npm run marketing:report
   ```

## ⚠️ トラブルシューティング

### エラー: `Environment variable not found: DATABASE_URL`

- `src/.env`ファイルが存在するか確認
- `DATABASE_URL`が正しく設定されているか確認
- ファイルのパスが正しいか確認（`src/.env`またはプロジェクトルートの`.env`）

### エラー: `Can't reach database server at localhost:5432`

- PostgreSQLが起動しているか確認
- `DATABASE_URL`の接続情報が正しいか確認
- ファイアウォール設定を確認

### エラー: `音声サンプルが不足しています`

- 先にシードデータを投入してください：
  ```bash
  npm run db:seed
  ```

## 📚 詳細情報

詳細な設定方法については、[データベース設定ガイド](../../データベース設定ガイド.md)を参照してください。

