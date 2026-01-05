# データベースセットアップ手順

## オプション1: Supabaseを使用（推奨）

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト設定から以下を取得：
   - Database URL（接続文字列）
4. `.env.local`ファイルを編集：

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
```

`[PASSWORD]`と`[PROJECT_ID]`を実際の値に置き換えてください。

## オプション2: ローカルPostgreSQLを使用

### macOSの場合

```bash
# HomebrewでPostgreSQLをインストール
brew install postgresql@14

# PostgreSQLを起動
brew services start postgresql@14

# データベースを作成
createdb ev_survey
```

`.env.local`ファイルを編集：

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ev_survey"
```

パスワードは実際のPostgreSQLのパスワードに置き換えてください。

## 次のステップ

データベース接続が設定されたら：

```bash
cd src

# データベーススキーマをプッシュ
npm run db:push

# シードデータを投入
npm run db:seed

# 200名分の擬似データを生成
npm run db:mock:200
```


# データベース接続設定
# Supabaseを使用する場合（推奨）:
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
# 
# ローカルPostgreSQLを使用する場合:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/ev_survey"
# 
# どちらかをコメントアウト解除して、実際の値に置き換えてください。

