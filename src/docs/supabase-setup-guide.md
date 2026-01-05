# Supabaseセットアップガイド（マーケティング分析レポート用）

## 🚀 クイックセットアップ（5分で完了）

### ステップ1: Supabaseアカウントの作成

1. [https://supabase.com](https://supabase.com) にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでログイン（推奨）またはメールアドレスで登録

### ステップ2: プロジェクトの作成

1. ダッシュボードで「New Project」をクリック
2. 以下の情報を入力：
   - **Name**: `ev-survey`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（**重要：後で使用します**）
   - **Region**: `Tokyo (Northeast Asia)`を選択（日本に近いため）
3. 「Create new project」をクリック
4. プロジェクトの作成が完了するまで待機（約2分）

### ステップ3: 接続情報の取得

1. プロジェクトが作成されたら、左側のメニューから「Settings」→「Database」をクリック
2. 「Connection string」セクションまでスクロール
3. 「URI」タブを選択
4. 表示された接続文字列をコピー
   - 形式: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - 例: `postgresql://postgres.abcdefghijklmnop:your-password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`

### ステップ4: `.env`ファイルの更新

1. `src/.env`ファイルを開く
2. 以下の行を探す：
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ev_survey"
   ```
3. この行を、Supabaseから取得した接続文字列に置き換える：
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```
   - `[PASSWORD]`は、ステップ2で設定したデータベースパスワードに置き換えてください
   - `[PROJECT_REF]`と`[REGION]`は、Supabaseから取得した値に置き換えてください

### ステップ5: データベースマイグレーション

```bash
cd src
npm run db:generate
npm run db:migrate
npm run db:seed
```

### ステップ6: 擬似データの生成

```bash
npm run db:mock:200
```

### ステップ7: マーケティング分析レポートの生成

```bash
npm run marketing:report
```

## ✅ 完了

これで、マーケティング分析レポートが生成されます！

生成されたファイルは `src/scripts/marketing-reports/marketing-analysis-report-YYYY-MM-DD.xlsx` に保存されます。

## ⚠️ トラブルシューティング

### エラー: `Can't reach database server`

- `.env`ファイルの`DATABASE_URL`が正しく設定されているか確認
- Supabaseのプロジェクトが作成されているか確認
- 接続文字列にパスワードが正しく含まれているか確認

### エラー: `音声サンプルが不足しています`

- 先にシードデータを投入してください：
  ```bash
  npm run db:seed
  ```

### エラー: `Environment variable not found: DATABASE_URL`

- `src/.env`ファイルが存在するか確認
- `DATABASE_URL`の行がコメントアウトされていないか確認

## 📚 参考資料

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)

