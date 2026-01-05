# 本番環境へのデプロイ手順

## 📋 前提条件

- Node.js 18以上がインストールされていること
- 本番環境用のPostgreSQLデータベース（Supabase推奨）
- デプロイ先のプラットフォーム（Vercel、Netlify、AWS等）のアカウント
- ドメイン（オプション、カスタムドメインを使用する場合）

---

## 🚀 ステップ1: 環境変数の設定

### 1.1 本番環境用の環境変数ファイルを作成

`src/.env.production`ファイルを作成し、以下のテンプレートをコピーしてください：

```env
# 本番環境用環境変数設定
# ============================================
# データベース接続（必須）
# ============================================
# Supabaseを使用する場合
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# または、他のPostgreSQLサービスを使用する場合
# DATABASE_URL="postgresql://user:password@host:5432/database"

# ============================================
# アプリケーション設定（必須）
# ============================================
# 本番環境のURL（HTTPS必須）
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# ============================================
# Supabase設定（オプション）
# ============================================
# Supabaseを使用する場合のみ設定
# NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
# NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# ============================================
# セキュリティ設定（推奨）
# ============================================
# NextAuth.jsを使用する場合（将来の拡張用）
# NEXTAUTH_SECRET="your-secret-key-here"
# NEXTAUTH_URL="https://your-domain.com"

# ============================================
# パフォーマンス・最適化（オプション）
# ============================================
# 動画ファイルのCDN URL（使用する場合）
# NEXT_PUBLIC_CDN_URL="https://cdn.your-domain.com"
```

### 1.2 環境変数を設定

上記のテンプレートを編集し、実際の値を設定：

#### 必須設定

```env
# データベース接続（Supabaseの場合）
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# 本番環境のURL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

#### オプション設定

```env
# Supabase設定（使用する場合）
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

**重要**: `.env.production`ファイルは`.gitignore`に含まれているため、Gitにはコミットされません。デプロイプラットフォームの環境変数設定画面で直接設定してください。

---

## 🗄️ ステップ2: データベース接続設定

### 2.1 Supabaseを使用する場合（推奨）

1. **Supabaseプロジェクトの作成**
   - [Supabase](https://supabase.com)でアカウントを作成
   - 新しいプロジェクトを作成
   - リージョンはユーザーに近い場所を選択（日本ユーザーの場合は`Tokyo`推奨）

2. **接続情報の取得**
   - プロジェクト設定 → Database → Connection string
   - 「URI」形式の接続文字列をコピー
   - パスワードを設定（強力なパスワードを推奨）

3. **接続設定の確認**
   - Connection poolingを有効にする（推奨）
   - IPアドレスの制限を設定（本番環境のIPアドレスのみ許可）

### 2.2 他のPostgreSQLサービスを使用する場合

- AWS RDS、Google Cloud SQL、Azure Database等
- 接続文字列の形式: `postgresql://user:password@host:5432/database`
- SSL接続を有効にする（本番環境では必須）

### 2.3 データベースマイグレーション

```bash
cd src

# Prismaクライアントを生成
npm run db:generate

# 本番環境のデータベースにマイグレーションを適用
DATABASE_URL="your-production-database-url" npx prisma migrate deploy

# シードデータを投入（初回のみ）
DATABASE_URL="your-production-database-url" npm run db:seed
```

**注意**: 本番環境では`prisma migrate deploy`を使用してください。`prisma migrate dev`は開発環境専用です。

---

## 📁 ステップ3: 動画ファイルの本番環境配置

### 3.1 オプションA: 同じサーバーに配置（小規模な場合）

動画ファイルを`public/audio/samples/`ディレクトリに配置します。

```bash
# 動画ファイルを配置
src/public/audio/samples/
├── sample-a.mp3
├── sample-b.mp3
├── sample-c.mp3
├── sample-d.mp3
└── sample-e.mp3
```

**メリット**: シンプル、追加の設定不要  
**デメリット**: サーバーのストレージ容量が必要、CDNの恩恵を受けられない

### 3.2 オプションB: CDNを使用（推奨・大規模な場合）

#### Cloudflare R2を使用する場合

1. **Cloudflare R2バケットの作成**
   - CloudflareダッシュボードでR2ストレージを作成
   - バケット名を設定（例: `ev-audio-samples`）

2. **ファイルのアップロード**
   - 動画ファイルをR2バケットにアップロード
   - パブリックアクセスを設定

3. **環境変数の設定**
   ```env
   NEXT_PUBLIC_CDN_URL="https://your-bucket.r2.cloudflarestorage.com"
   ```

4. **コードの修正**
   - `src/src/lib/mediaFiles.ts`でCDN URLを使用するように修正

#### AWS S3を使用する場合

1. **S3バケットの作成**
   - AWSコンソールでS3バケットを作成
   - パブリックアクセスを設定（必要に応じて）

2. **CloudFrontディストリビューションの作成**（推奨）
   - CDNとしてCloudFrontを使用
   - キャッシュ設定を最適化

3. **環境変数の設定**
   ```env
   NEXT_PUBLIC_CDN_URL="https://your-cloudfront-domain.cloudfront.net"
   ```

### 3.3 ファイルサイズの最適化

本番環境では、動画ファイルのサイズを最適化することを推奨します：

```bash
# FFmpegを使用して動画を圧縮（例）
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4
```

**推奨設定**:
- ビデオコーデック: H.264
- オーディオビットレート: 128kbps
- 解像度: 最大1920x1080（必要に応じて）

---

## 🔒 ステップ4: SSL証明書の設定（HTTPS対応）

### 4.1 Vercelを使用する場合

Vercelは自動的にSSL証明書を提供します：

1. プロジェクトをVercelにデプロイ
2. カスタムドメインを追加
3. Vercelが自動的にSSL証明書を発行・更新

### 4.2 Netlifyを使用する場合

Netlifyも自動的にSSL証明書を提供します：

1. プロジェクトをNetlifyにデプロイ
2. カスタムドメインを追加
3. Netlifyが自動的にSSL証明書を発行・更新

### 4.3 独自サーバーを使用する場合

#### Let's Encryptを使用（無料）

```bash
# Certbotをインストール
sudo apt-get install certbot python3-certbot-nginx

# SSL証明書を取得
sudo certbot --nginx -d your-domain.com

# 自動更新を設定
sudo certbot renew --dry-run
```

#### Nginx設定例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # その他の設定...
}
```

---

## 🚀 ステップ5: デプロイ

### 5.1 Vercelを使用する場合

```bash
# Vercel CLIをインストール
npm i -g vercel

# プロジェクトにログイン
vercel login

# デプロイ
cd src
vercel --prod

# 環境変数を設定
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_APP_URL production
```

### 5.2 Netlifyを使用する場合

1. Netlifyダッシュボードで新しいサイトを作成
2. GitHubリポジトリを接続
3. ビルド設定:
   - Build command: `cd src && npm run build`
   - Publish directory: `src/.next`
4. 環境変数を設定（Site settings → Environment variables）

### 5.3 Dockerを使用する場合

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ✅ ステップ6: デプロイ後の確認

### 6.1 動作確認チェックリスト

- [ ] ランディングページが表示される
- [ ] アンケートフローが正常に動作する
- [ ] 音声・動画が正しく再生される
- [ ] データベース接続が正常に動作する
- [ ] フォーム送信が正常に動作する
- [ ] HTTPSが有効になっている
- [ ] パフォーマンスが良好（Lighthouseスコア確認）

### 6.2 パフォーマンス確認

```bash
# Lighthouseを使用してパフォーマンスを確認
npx lighthouse https://your-domain.com --view
```

**目標スコア**:
- Performance: 80以上
- Accessibility: 90以上
- Best Practices: 90以上
- SEO: 90以上

### 6.3 エラーログの確認

デプロイプラットフォームのログを確認し、エラーがないか確認してください。

---

## 🔧 トラブルシューティング

### データベース接続エラー

1. `DATABASE_URL`が正しく設定されているか確認
2. データベースのIPアドレス制限を確認
3. SSL接続が必要な場合は、接続文字列に`?sslmode=require`を追加

### 動画ファイルが読み込めない

1. ファイルパスが正しいか確認
2. CDNを使用している場合、CDN URLが正しく設定されているか確認
3. CORS設定を確認

### HTTPSリダイレクトが動作しない

1. `NEXT_PUBLIC_APP_URL`がHTTPSで設定されているか確認
2. デプロイプラットフォームの設定を確認

---

## 📚 参考資料

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)

