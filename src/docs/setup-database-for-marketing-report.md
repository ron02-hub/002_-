# マーケティング分析レポート用データベース設定

## 📋 現在の状況

`.env`ファイルに`DATABASE_URL`が設定されていないため、データベースに接続できません。

## 🚀 解決方法

### ステップ1: `.env`ファイルの確認

`src/.env`ファイルを開き、`DATABASE_URL`が設定されているか確認してください。

### ステップ2: データベース接続の設定

#### オプションA: Supabaseを使用（推奨）

1. **Supabaseアカウントの作成**
   - [https://supabase.com](https://supabase.com) にアクセス
   - アカウントを作成

2. **プロジェクトの作成**
   - ダッシュボードで「New Project」をクリック
   - プロジェクト名を入力
   - データベースパスワードを設定
   - リージョンを選択（`Tokyo`推奨）

3. **接続情報の取得**
   - 「Settings」→「Database」に移動
   - 「Connection string」セクションで「URI」を選択
   - 接続文字列をコピー

4. **`.env`ファイルの編集**
   - `src/.env`ファイルを開く
   - 以下の行のコメントを外し、接続文字列を設定：
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```

#### オプションB: ローカルPostgreSQLを使用

1. **PostgreSQLの起動確認**
   ```bash
   # macOS (Homebrew)
   brew services start postgresql@14
   ```

2. **データベースの作成**
   ```bash
   createdb ev_survey
   ```

3. **`.env`ファイルの編集**
   - `src/.env`ファイルを開く
   - 以下の行のコメントを外し、接続文字列を設定：
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ev_survey"
   ```
   - `password`は、PostgreSQLのパスワードに置き換えてください

### ステップ3: データベースマイグレーション

```bash
cd src
npm run db:generate
npm run db:migrate
npm run db:seed
```

### ステップ4: 擬似データの生成

```bash
npm run db:mock:200
```

### ステップ5: マーケティング分析レポートの生成

```bash
npm run marketing:report
```

## ⚠️ 注意事項

- `.env`ファイルは`.gitignore`に含まれているため、Gitにはコミットされません
- 接続文字列にはパスワードが含まれるため、機密情報として扱ってください
- Supabaseを使用する場合、無料プランでも十分に使用できます

## 📚 詳細情報

詳細な設定方法については、[データベース設定ガイド](../../データベース設定ガイド.md)を参照してください。

