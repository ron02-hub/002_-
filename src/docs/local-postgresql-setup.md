# ローカルPostgreSQLセットアップガイド

## 🚀 macOSでのセットアップ手順

### ステップ1: Homebrewの確認

```bash
which brew
```

Homebrewがインストールされていない場合は、以下を実行：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### ステップ2: PostgreSQLのインストール

```bash
# PostgreSQLをインストール
brew install postgresql@14

# または最新版をインストール
brew install postgresql
```

### ステップ3: PostgreSQLの起動

```bash
# PostgreSQLサービスを起動
brew services start postgresql@14

# または最新版の場合
brew services start postgresql
```

### ステップ4: データベースの作成

```bash
# デフォルトのpostgresユーザーでデータベースを作成
createdb ev_survey

# または、psqlを使用して作成
psql postgres -c "CREATE DATABASE ev_survey;"
```

### ステップ5: 接続確認

```bash
# データベースに接続して確認
psql ev_survey

# 接続できたら、以下のコマンドで終了
\q
```

### ステップ6: `.env`ファイルの設定

`src/.env`ファイルを開き、以下のように設定：

```env
DATABASE_URL="postgresql://postgres@localhost:5432/ev_survey"
```

**注意**: 
- macOSのデフォルトでは、PostgreSQLのパスワードは設定されていません
- パスワードを設定している場合は、`postgresql://postgres:password@localhost:5432/ev_survey` のように設定してください

### ステップ7: データベースマイグレーション

```bash
cd src
npm run db:generate
npm run db:migrate
npm run db:seed
```

### ステップ8: 擬似データの生成

```bash
npm run db:mock:200
```

### ステップ9: マーケティング分析レポートの生成

```bash
npm run marketing:report
```

## ⚠️ トラブルシューティング

### エラー: `command not found: createdb`

PostgreSQLが正しくインストールされていない可能性があります。以下を確認：

```bash
# PostgreSQLのパスを確認
which psql

# Homebrewのパスを確認
echo $PATH

# Homebrewのパスが含まれていない場合、以下を実行
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### エラー: `Can't reach database server at localhost:5432`

PostgreSQLが起動していない可能性があります：

```bash
# PostgreSQLサービスの状態を確認
brew services list

# PostgreSQLを起動
brew services start postgresql@14
```

### エラー: `database "ev_survey" does not exist`

データベースが作成されていない可能性があります：

```bash
# データベースを作成
createdb ev_survey

# または
psql postgres -c "CREATE DATABASE ev_survey;"
```

### エラー: `password authentication failed`

パスワード認証が必要な場合：

1. PostgreSQLのパスワードを設定：
   ```bash
   psql postgres
   ALTER USER postgres PASSWORD 'your-password';
   \q
   ```

2. `.env`ファイルを更新：
   ```env
   DATABASE_URL="postgresql://postgres:your-password@localhost:5432/ev_survey"
   ```

### PostgreSQLのバージョン確認

```bash
# インストールされているPostgreSQLのバージョンを確認
psql --version

# または
brew list | grep postgres
```

## 📚 参考資料

- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [Homebrew公式ドキュメント](https://brew.sh/)

