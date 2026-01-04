# EV走行音アンケートアプリケーション

🚗 電気自動車（EV）走行音のユーザー印象を科学的に評価するWebアンケートシステム

## 📋 プロジェクト概要

本プロジェクトは、EV走行音に対するユーザーの深層心理を探索し、購買意欲向上につながるサウンドデザインの知見を得ることを目的としたWebアンケートアプリケーションです。

### 主な特徴

- **デプスインタビュー型UI**: チャット形式で深層心理を引き出す対話型インターフェース
- **評価グリッド法**: ユーザーの価値構造を可視化するトライアド比較＆ラダリング
- **SD法評価**: 音の印象を多次元で定量化
- **A/Bテスト対応**: ランダム化比較試験による統計的検証
- **価値ツリー可視化**: D3.jsによるインタラクティブな階層表示

## 🎯 対象ユーザー

- **回答者**: 日本国内の成人（20〜70歳）
- **分析者**: マーケティング担当者、音響エンジニア、製品企画担当者

## 📁 プロジェクト構造

```
002_アンケート/
├── README.md                 # 本ファイル
├── プロンプト.txt            # プロジェクト要件
├── specs/                    # 仕様書（Kiro-style）
│   ├── requirements.md       # 要件定義書
│   ├── design.md             # 設計書
│   ├── architecture.md       # アーキテクチャ設計書
│   └── tasks.md              # タスク一覧
├── docs/                     # ドキュメント
├── src/                      # ソースコード（開発時に作成）
│   ├── app/                  # Next.js App Router
│   ├── components/           # Reactコンポーネント
│   ├── lib/                  # ユーティリティ
│   ├── stores/               # Zustand stores
│   └── styles/               # スタイル
└── analysis/                 # Python分析スクリプト（開発時に作成）
```

## 🛠 技術スタック

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (状態管理)
- Howler.js (音声再生) + HTML5 Video (動画再生)
- MediaPlayer (音声・動画統合プレーヤー)
- D3.js + Recharts (可視化)

### バックエンド
- Next.js API Routes
- Prisma (ORM)
- PostgreSQL (Supabase)

### 分析基盤
- Python 3.11+
- MeCab (形態素解析)
- Transformers (感情分析)
- scikit-learn (機械学習)

## 📊 評価手法

### 1. SD法（Semantic Differential）
7段階スケールで音の印象を多次元評価
- 静か ↔ うるさい
- 心地よい ↔ 不快
- 高級感 ↔ 安っぽい
- など8軸

### 2. 評価グリッド法（Repertory Grid）
3つの走行音を比較し、ユーザー固有の評価軸（コンストラクト）を抽出

### 3. ラダリング
「なぜそれが重要ですか？」を繰り返し、表面的な印象から深層価値へ到達

### 4. デプスインタビュー型質問
AIが動的に質問を生成し、対話形式で深掘り

## 🚀 開発ロードマップ

| フェーズ | 期間 | 内容 | ステータス |
|----------|------|------|-----------|
| Phase 1 | Week 1-2 | 基盤構築（Next.js, DB, 音声再生） | ✅ 完了 |
| Phase 2 | Week 3-5 | コア機能（評価UI, インタビューUI） | ✅ 完了 |
| Phase 3 | Week 6-7 | 分析機能（NLP, 可視化） | ✅ 完了 |
| Phase 4 | Week 8 | 最適化・テスト | ✅ 完了 |

## 📝 仕様書

詳細な仕様は以下のドキュメントを参照してください：

### Kiro形式ドキュメント
- [要件定義書](./要件定義書.md)
- [技術設計書](./技術設計書.md)
- [実装計画書](./実装計画書.md)
- [アンケート設計書](./アンケート設計.md)

### 詳細仕様書（specs/）
- [要件定義書](./specs/requirements.md)
- [設計書](./specs/design.md)
- [アーキテクチャ設計書](./specs/architecture.md)
- [タスク一覧](./specs/tasks.md)
- [改善計画](./specs/improvements.md)
- [テスト結果](./specs/test-results.md)

## 🔧 開発環境セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- PostgreSQL（Supabase推奨）

### セットアップ手順

```bash
# 1. リポジトリをクローン（または既存ディレクトリに移動）
cd 002_アンケート

# 2. 依存関係のインストール
cd src
npm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.local を編集してデータベース接続情報を設定

# 4. Prismaクライアント生成
npm run db:generate

# 5. データベースマイグレーション
npm run db:migrate

# 6. シードデータ投入
npm run db:seed

# 7. 開発サーバー起動
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

### Python分析環境のセットアップ（オプション）

```bash
cd src/analysis
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 📈 成功指標

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| アンケート完了率 | 80%以上 | 完了数 / 開始数 |
| 平均回答時間 | 40〜50分 | 回答時間の平均 |
| 自由記述平均文字数 | 100文字以上/質問 | 文字数の平均 |
| コンストラクト抽出数 | 5個以上/回答者 | トライアド比較結果 |

## ✅ 実装完了機能

### Phase 1: 基盤構築 ✅
- Next.js 14プロジェクト（TypeScript, App Router）
- Prisma + PostgreSQL（Supabase）
- Zustand状態管理
- MediaPlayer（音声・動画統合再生）
- 基本レイアウト・進捗バー
- メディアファイル管理（動画・音声テスト対応）

### Phase 2: コア機能 ✅
- ランディングページ
- 同意・属性入力フォーム
- SD法評価画面（8軸）
- 購買意欲評価
- トライアド比較（評価グリッド法）
- ラダリング機能
- デプスインタビュー型UI（チャット形式）

### Phase 3: 分析機能 ✅
- 価値ツリー可視化（D3.js）
- SD法レーダーチャート
- 購買意欲分布ヒストグラム
- クロス集計テーブル
- 因子分析
- NLP分析（MeCab/BERT対応）
- 管理者ダッシュボード

### Phase 4: 最適化・テスト ✅
- エラーハンドリング（ErrorBoundary）
- ローディング状態管理とエラー表示
- 中断・再開機能
- パフォーマンス最適化（ストリーミング対応）
- Jestテスト環境
- ユニットテスト実装
- テストモード機能（クエリパラメータ対応）

## 🧪 テスト

```bash
# ユニットテスト実行
npm test

# テストカバレッジ
npm run test:coverage

# ウォッチモード
npm run test:watch
```

## 📊 主要画面

- `/` - ランディングページ
- `/survey/consent` - 同意画面
- `/survey/demographics` - 属性入力
- `/survey/audio-check` - 音声チェック
- `/survey/evaluation` - 音声評価（SD法）
- `/survey/triad` - トライアド比較
- `/survey/laddering` - ラダリング
- `/survey/interview` - デプスインタビュー
- `/survey/complete` - 完了画面
- `/survey/resume` - 中断したアンケート再開
- `/admin/dashboard` - 管理者ダッシュボード

## 📄 ライセンス

Private - All rights reserved

## 更新履歴

| 日付 | バージョン | 更新内容 |
|------|-----------|----------|
| 2026-01-01 | 0.1.0 | 仕様書作成、プロジェクト初期化 |
| 2026-01-01 | 1.0.0 | Phase 1-4完了、全機能実装完了 |
| 2026-01-01 | 1.1.0 | 音声・動画統合再生対応、エラーハンドリング改善 |

