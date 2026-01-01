# EV走行音アンケートアプリケーション システムアーキテクチャ設計書

## 1. システム全体構成

### 1.1 アーキテクチャ概要図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Layer                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│   │   回答者用      │    │   管理者用      │    │   分析者用      │   │
│   │   Web App       │    │   Dashboard     │    │   Dashboard     │   │
│   │   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │   │
│   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘   │
│            │                      │                      │             │
└────────────┼──────────────────────┼──────────────────────┼─────────────┘
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Layer                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     Next.js API Routes                          │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │
│   │   │ /survey  │  │ /audio   │  │ /analysis│  │ /admin   │       │   │
│   │   └──────────┘  └──────────┘  └──────────┘  └──────────┘       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                     ┌──────────────┼──────────────┐                    │
│                     ▼              ▼              ▼                    │
│              ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│              │   Prisma   │ │ Howler.js  │ │ OpenAI API │              │
│              │   ORM      │ │ (Audio)    │ │ (NLP)      │              │
│              └────────────┘ └────────────┘ └────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Data Layer                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│   │   PostgreSQL    │    │   Cloudflare    │    │   Redis         │   │
│   │   (Primary DB)  │    │   R2 (Audio)    │    │   (Session)     │   │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Analysis Pipeline                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                    Python Analysis Engine                      │    │
│   │   ┌────────────┐  ┌────────────┐  ┌────────────┐             │    │
│   │   │ NLP Module │  │ Statistics │  │ ML Module  │             │    │
│   │   │ (MeCab,    │  │ (scipy,    │  │ (scikit-   │             │    │
│   │   │  BERT)     │  │  pandas)   │  │  learn)    │             │    │
│   │   └────────────┘  └────────────┘  └────────────┘             │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 技術スタック詳細

### 2.1 フロントエンド

| カテゴリ | 技術 | バージョン | 選定理由 |
|----------|------|-----------|----------|
| フレームワーク | Next.js | 14.x | SSR/SSG対応、API Routes一体型 |
| 言語 | TypeScript | 5.x | 型安全性、開発効率 |
| スタイリング | Tailwind CSS | 3.x | ユーティリティファースト、カスタマイズ性 |
| UIコンポーネント | shadcn/ui | latest | アクセシビリティ、カスタマイズ可能 |
| 状態管理 | Zustand | 4.x | シンプル、TypeScript親和性 |
| フォーム | React Hook Form + Zod | - | バリデーション、型安全 |
| 音声再生 | Howler.js | 2.x | クロスブラウザ対応、Web Audio API |
| 可視化 | D3.js + Recharts | - | カスタム可視化 + グラフ |
| アニメーション | Framer Motion | 10.x | 滑らかなUI遷移 |

### 2.2 バックエンド

| カテゴリ | 技術 | バージョン | 選定理由 |
|----------|------|-----------|----------|
| API | Next.js API Routes | 14.x | フロントエンドと一体型 |
| ORM | Prisma | 5.x | 型安全、マイグレーション |
| 認証 | NextAuth.js | 5.x | OAuth対応、セッション管理 |
| バリデーション | Zod | 3.x | ランタイム型チェック |

### 2.3 データベース・ストレージ

| カテゴリ | 技術 | 選定理由 |
|----------|------|----------|
| メインDB | PostgreSQL (Supabase) | JSONB対応、フルテキスト検索 |
| キャッシュ | Redis (Upstash) | セッション、一時データ |
| オブジェクトストレージ | Cloudflare R2 | 音声ファイル、低コスト |

### 2.4 分析基盤

| カテゴリ | 技術 | 選定理由 |
|----------|------|----------|
| 言語 | Python 3.11+ | データサイエンス標準 |
| NLP | MeCab + fugashi | 日本語形態素解析 |
| 感情分析 | transformers (日本語BERT) | 高精度感情分類 |
| 統計 | pandas, scipy, statsmodels | 統計解析 |
| 機械学習 | scikit-learn | クラスタリング、因子分析 |
| 可視化 | matplotlib, plotly | 分析グラフ生成 |

---

## 3. データベース設計

### 3.1 ER図

```
┌─────────────────┐       ┌─────────────────┐
│   Respondent    │       │   AudioSample   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ session_id      │       │ name            │
│ experiment_group│       │ description     │
│ age_group       │       │ file_url        │
│ gender          │       │ duration        │
│ prefecture      │       │ category        │
│ driving_exp     │       │ metadata (JSON) │
│ ev_ownership    │       │ created_at      │
│ audio_sensitivity│      └────────┬────────┘
│ created_at      │                │
│ completed_at    │                │
└────────┬────────┘                │
         │                         │
         │    ┌────────────────────┼────────────────────┐
         │    │                    │                    │
         ▼    ▼                    ▼                    ▼
┌─────────────────┐       ┌─────────────────┐   ┌─────────────────┐
│   Evaluation    │       │    Triad        │   │  InterviewLog   │
├─────────────────┤       ├─────────────────┤   ├─────────────────┤
│ id (PK)         │       │ id (PK)         │   │ id (PK)         │
│ respondent_id   │◄──────│ respondent_id   │   │ respondent_id   │
│ audio_sample_id │       │ audio_1_id (FK) │   │ question_id     │
│ presentation_order│     │ audio_2_id (FK) │   │ question_text   │
│ sd_scores (JSON)│       │ audio_3_id (FK) │   │ response_text   │
│ purchase_intent │       │ similar_pair    │   │ sentiment_score │
│ free_text       │       │ different_one   │   │ keywords (JSON) │
│ response_time   │       │ similarity_reason│  │ depth_level     │
│ created_at      │       │ difference_reason│  │ topic           │
└─────────────────┘       │ created_at      │   │ response_time   │
                          └────────┬────────┘   │ created_at      │
                                   │            └─────────────────┘
                                   ▼
                          ┌─────────────────┐
                          │   Construct     │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ triad_id (FK)   │
                          │ respondent_id   │
                          │ construct_text  │
                          │ pole_left       │
                          │ pole_right      │
                          │ ladder_up (JSON)│
                          │ ladder_down(JSON)│
                          │ level           │
                          │ parent_id (FK)  │
                          │ created_at      │
                          └─────────────────┘
```

### 3.2 Prismaスキーマ

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Respondent {
  id               String        @id @default(cuid())
  sessionId        String        @unique
  experimentGroup  String
  ageGroup         String
  gender           String
  prefecture       String?
  drivingExperience Int
  evOwnership      Boolean       @default(false)
  audioSensitivity Int
  consentGiven     Boolean       @default(false)
  headphoneCheck   Boolean       @default(false)
  createdAt        DateTime      @default(now())
  completedAt      DateTime?
  
  evaluations      Evaluation[]
  triads           Triad[]
  constructs       Construct[]
  interviewLogs    InterviewLog[]
}

model AudioSample {
  id          String   @id @default(cuid())
  name        String
  description String?
  fileUrl     String
  duration    Int      // seconds
  category    String
  metadata    Json?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  evaluations   Evaluation[]
  triadsAs1     Triad[]     @relation("Audio1")
  triadsAs2     Triad[]     @relation("Audio2")
  triadsAs3     Triad[]     @relation("Audio3")
}

model Evaluation {
  id                 String      @id @default(cuid())
  respondentId       String
  audioSampleId      String
  presentationOrder  Int
  sdScores           Json        // {quiet: 2, pleasant: 1, ...}
  purchaseIntent     Int         // 1-7
  freeText           String?
  responseTimeMs     Int?
  createdAt          DateTime    @default(now())
  
  respondent   Respondent  @relation(fields: [respondentId], references: [id])
  audioSample  AudioSample @relation(fields: [audioSampleId], references: [id])
  
  @@unique([respondentId, audioSampleId])
}

model Triad {
  id               String   @id @default(cuid())
  respondentId     String
  audio1Id         String
  audio2Id         String
  audio3Id         String
  similarPair      String[] // [audio1Id, audio2Id]
  differentOne     String
  similarityReason String
  differenceReason String
  triadOrder       Int
  createdAt        DateTime @default(now())
  
  respondent Respondent  @relation(fields: [respondentId], references: [id])
  audio1     AudioSample @relation("Audio1", fields: [audio1Id], references: [id])
  audio2     AudioSample @relation("Audio2", fields: [audio2Id], references: [id])
  audio3     AudioSample @relation("Audio3", fields: [audio3Id], references: [id])
  constructs Construct[]
}

model Construct {
  id            String   @id @default(cuid())
  triadId       String
  respondentId  String
  constructText String
  poleLeft      String?
  poleRight     String?
  ladderUp      Json?    // ["より上位の概念1", "より上位の概念2"]
  ladderDown    Json?    // ["より具体的な概念1"]
  level         String   // terminal, instrumental, functional, physical
  parentId      String?
  createdAt     DateTime @default(now())
  
  triad      Triad       @relation(fields: [triadId], references: [id])
  respondent Respondent  @relation(fields: [respondentId], references: [id])
  parent     Construct?  @relation("ConstructHierarchy", fields: [parentId], references: [id])
  children   Construct[] @relation("ConstructHierarchy")
}

model InterviewLog {
  id            String   @id @default(cuid())
  respondentId  String
  questionId    String
  questionText  String
  responseText  String
  sentimentScore Float?  // -1 to 1
  keywords      Json?    // ["キーワード1", "キーワード2"]
  depthLevel    Int      // 0-3
  topic         String   // favorite, purchase, ideal
  responseTimeMs Int?
  createdAt     DateTime @default(now())
  
  respondent Respondent @relation(fields: [respondentId], references: [id])
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   @default("viewer") // admin, editor, viewer
  createdAt DateTime @default(now())
}
```

---

## 4. API設計

### 4.1 エンドポイント一覧

#### 回答者向けAPI

| メソッド | パス | 説明 |
|----------|------|------|
| POST | `/api/survey/start` | アンケート開始、セッション作成 |
| POST | `/api/survey/consent` | 同意情報保存 |
| POST | `/api/survey/demographics` | 属性情報保存 |
| GET | `/api/audio/samples` | 音声サンプル一覧取得 |
| GET | `/api/audio/samples/:id` | 音声ファイルURL取得 |
| POST | `/api/survey/evaluation` | SD法評価保存 |
| POST | `/api/survey/triad` | トライアド回答保存 |
| POST | `/api/survey/construct` | コンストラクト保存 |
| POST | `/api/survey/interview` | インタビュー回答保存 |
| POST | `/api/survey/complete` | アンケート完了 |
| GET | `/api/survey/progress` | 進捗状況取得 |

#### 管理者向けAPI

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/admin/responses` | 回答一覧取得 |
| GET | `/api/admin/responses/:id` | 回答詳細取得 |
| GET | `/api/admin/statistics` | 統計情報取得 |
| POST | `/api/admin/audio` | 音声サンプル追加 |
| PUT | `/api/admin/audio/:id` | 音声サンプル更新 |
| DELETE | `/api/admin/audio/:id` | 音声サンプル削除 |
| GET | `/api/admin/export` | データエクスポート |

#### 分析向けAPI

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/analysis/value-tree` | 価値ツリーデータ取得 |
| GET | `/api/analysis/constructs` | コンストラクト分析結果 |
| GET | `/api/analysis/nlp` | NLP分析結果 |
| GET | `/api/analysis/clusters` | クラスター分析結果 |

### 4.2 API仕様例

```typescript
// POST /api/survey/evaluation
interface EvaluationRequest {
  respondentId: string;
  audioSampleId: string;
  sdScores: {
    quiet: number;      // -3 to +3
    pleasant: number;   // -3 to +3
    premium: number;    // -3 to +3
    modern: number;     // -3 to +3
    powerful: number;   // -3 to +3
    safe: number;       // -3 to +3
    exciting: number;   // -3 to +3
    natural: number;    // -3 to +3
  };
  purchaseIntent: number; // 1 to 7
  freeText?: string;
  responseTimeMs: number;
}

interface EvaluationResponse {
  success: boolean;
  evaluationId: string;
  nextStep: 'evaluation' | 'triad' | 'complete';
  progress: number; // 0-100
}
```

---

## 5. 状態管理設計

### 5.1 Zustand Store構成

```typescript
// stores/surveyStore.ts

interface SurveyState {
  // Session
  sessionId: string | null;
  respondentId: string | null;
  experimentGroup: string | null;
  
  // Progress
  currentPhase: Phase;
  currentStep: number;
  totalSteps: number;
  
  // Audio
  audioSamples: AudioSample[];
  currentAudioIndex: number;
  audioOrder: string[];
  
  // Evaluations
  evaluations: Map<string, Evaluation>;
  
  // Triads
  triads: Triad[];
  currentTriadIndex: number;
  
  // Constructs
  constructs: Construct[];
  
  // Interview
  interviewHistory: InterviewMessage[];
  currentTopic: string;
  
  // Actions
  startSurvey: () => Promise<void>;
  submitConsent: (data: ConsentData) => Promise<void>;
  submitDemographics: (data: DemographicsData) => Promise<void>;
  submitEvaluation: (data: EvaluationData) => Promise<void>;
  submitTriad: (data: TriadData) => Promise<void>;
  submitConstruct: (data: ConstructData) => Promise<void>;
  submitInterview: (data: InterviewData) => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
}

type Phase = 
  | 'welcome'
  | 'consent'
  | 'demographics'
  | 'audio-check'
  | 'evaluation'
  | 'triad'
  | 'laddering'
  | 'interview'
  | 'complete';
```

### 5.2 状態遷移図

```
┌─────────────────────────────────────────────────────────────────┐
│                        State Machine                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────┐    consent    ┌─────────┐    submit    ┌───────┐ │
│   │ welcome │──────────────▶│ consent │─────────────▶│ demo- │ │
│   └─────────┘               └─────────┘              │graphics│ │
│                                                      └───┬───┘ │
│                                                          │     │
│   ┌─────────┐    all_done   ┌─────────┐    pass     ┌───▼───┐ │
│   │  eval   │◀──────────────│  audio  │◀────────────│ audio │ │
│   │ sample1 │               │  check  │             │ check │ │
│   └────┬────┘               └─────────┘             └───────┘ │
│        │                          ▲                           │
│        │ next                     │ retry                     │
│        ▼                          │                           │
│   ┌─────────┐    next       ┌─────────┐    next    ┌───────┐ │
│   │  eval   │──────────────▶│  eval   │───────────▶│ triad │ │
│   │ sample2 │               │ sample3 │            │   1   │ │
│   └─────────┘               └─────────┘            └───┬───┘ │
│                                                        │     │
│                                                        ▼     │
│   ┌─────────┐    next       ┌─────────┐    next   ┌───────┐ │
│   │  triad  │◀──────────────│  triad  │◀──────────│ladder │ │
│   │    3    │               │    2    │           │  ing  │ │
│   └────┬────┘               └─────────┘           └───────┘ │
│        │                                                     │
│        │ all_triads_done                                    │
│        ▼                                                     │
│   ┌─────────┐    finish     ┌─────────┐                     │
│   │interview│──────────────▶│complete │                     │
│   └─────────┘               └─────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. セキュリティ設計

### 6.1 認証・認可

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Admin routes protection
  if (path.startsWith('/admin')) {
    const session = request.cookies.get('admin-session');
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // API rate limiting headers
  if (path.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
```

### 6.2 データ保護

| 対策 | 実装方法 |
|------|----------|
| 通信暗号化 | HTTPS必須 (Let's Encrypt) |
| データ暗号化 | PostgreSQL TDE |
| 個人情報 | 匿名ID使用、個人特定情報非収集 |
| セッション | httpOnly Cookie、SameSite=Strict |
| CSRF | Next.js built-in protection |
| XSS | React自動エスケープ、CSP headers |

---

## 7. デプロイメント構成

### 7.1 インフラ構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Next.js App                           │   │
│   │   ┌───────────┐   ┌───────────┐   ┌───────────┐        │   │
│   │   │  Pages    │   │   API     │   │  Static   │        │   │
│   │   │  (SSR)    │   │  Routes   │   │  Assets   │        │   │
│   │   └───────────┘   └─────┬─────┘   └───────────┘        │   │
│   └─────────────────────────┼───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Supabase     │ │  Cloudflare R2  │ │  Upstash Redis  │
│   PostgreSQL    │ │   (Audio CDN)   │ │   (Session)     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 7.2 環境変数

```env
# .env.local

# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="ev-audio-samples"

# Redis
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."

# Analysis (Python)
OPENAI_API_KEY="..."
```

---

## 8. パフォーマンス最適化

### 8.1 音声ファイル最適化

| 最適化項目 | 実装方法 |
|------------|----------|
| フォーマット | MP3 (128-192kbps) + WAV (高品質再生用) |
| プリロード | 次の音声を事前読み込み |
| ストリーミング | Range request対応 |
| キャッシュ | CDN (Cloudflare) 1週間 |
| フォールバック | Web Audio API → HTML5 Audio |

### 8.2 レスポンス最適化

```typescript
// 音声プリロード戦略
const useAudioPreload = (audioUrls: string[]) => {
  useEffect(() => {
    audioUrls.forEach((url, index) => {
      if (index <= 1) { // 最初の2つは即座にロード
        const audio = new Audio(url);
        audio.preload = 'auto';
      }
    });
  }, [audioUrls]);
};
```

---

## 9. モニタリング・ログ

### 9.1 ログ構成

```typescript
// lib/logger.ts

import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    bindings: () => ({}),
  },
});

// Usage
logger.info({ respondentId, phase: 'evaluation' }, 'Evaluation submitted');
logger.error({ error, respondentId }, 'Failed to save response');
```

### 9.2 メトリクス

| メトリクス | 説明 | アラート閾値 |
|------------|------|-------------|
| 完了率 | アンケート完了率 | < 60% |
| 平均回答時間 | フェーズごとの所要時間 | > 60分 |
| エラー率 | API エラー率 | > 1% |
| 音声再生失敗率 | 音声ロード失敗 | > 5% |

---

## 更新履歴

| 日付 | バージョン | 更新内容 | 担当者 |
|------|-----------|----------|--------|
| 2026-01-01 | 1.0.0 | 初版作成 | - |

