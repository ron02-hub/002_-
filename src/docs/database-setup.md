# データベースセットアップ手順

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト設定から以下を取得：
   - Database URL（接続文字列）
   - Project URL
   - Anon Key

## 2. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定：

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## 3. Prismaマイグレーション

```bash
# Prismaクライアントを生成
npm run db:generate

# データベースにマイグレーションを適用
npm run db:migrate

# シードデータを投入
npm run db:seed
```

## 4. 確認

```bash
# Prisma Studioでデータベースを確認
npm run db:studio
```

## トラブルシューティング

### 接続エラーが発生する場合

1. DATABASE_URLが正しいか確認
2. Supabaseの接続設定で「Allow connections from anywhere」が有効か確認
3. ファイアウォール設定を確認

### マイグレーションエラーが発生する場合

```bash
# マイグレーションをリセット（開発環境のみ）
npx prisma migrate reset
```

