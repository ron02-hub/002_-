# E2Eテストガイド

## 概要

本プロジェクトでは、Playwrightを使用してE2E（End-to-End）テストを実装しています。

## セットアップ

### 1. Playwrightのインストール

```bash
cd src
npm install -D @playwright/test playwright
npx playwright install --with-deps chromium
```

### 2. 設定ファイル

`playwright.config.ts`で設定を管理しています。

## テストの実行

### 基本的な実行

```bash
# すべてのE2Eテストを実行
npm run test:e2e

# UIモードで実行（視覚的に確認しながら）
npm run test:e2e:ui

# ヘッドモードで実行（ブラウザを表示）
npm run test:e2e:headed

# デバッグモードで実行
npm run test:e2e:debug
```

### 特定のテストファイルを実行

```bash
npx playwright test e2e/landing-page.spec.ts
```

### 特定のテストを実行

```bash
npx playwright test -g "ランディングページ"
```

## テストファイル構成

```
src/
├── e2e/
│   ├── landing-page.spec.ts      # ランディングページのテスト
│   ├── survey-flow.spec.ts       # アンケートフローのテスト
│   └── video-player.spec.ts      # 動画再生機能のテスト
└── playwright.config.ts           # Playwright設定ファイル
```

## テストシナリオ

### 1. ランディングページ（landing-page.spec.ts）

- ページが正しく表示される
- 「アンケートを開始する」ボタンをクリックすると同意ページに遷移する
- 特徴カードが表示されている

### 2. アンケートフロー（survey-flow.spec.ts）

- 同意ページから音声評価ページまで進める
- 音声チェックで間違った答えを選ぶと進めない

### 3. 動画再生機能（video-player.spec.ts）

- 動画プレーヤーが表示される
- 再生ボタンをクリックすると動画が再生される
- 動画の読み込みエラーが適切に表示される

## ベストプラクティス

### 1. セレクターの選択

- `data-testid`属性を使用することを推奨
- テキストベースのセレクターは控えめに使用
- ロールベースのセレクターを優先

### 2. 待機処理

- `waitForSelector`や`waitForTimeout`を適切に使用
- 動的なコンテンツの読み込みを待つ

### 3. テストの独立性

- 各テストは独立して実行できるようにする
- テスト間で状態を共有しない

### 4. エラーハンドリング

- エラーが発生した場合のスクリーンショットとトレースを確認
- CI環境では自動的に保存される

## CI/CD統合

### GitHub Actions例

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd src
          npm ci
          npx playwright install --with-deps chromium
      - name: Run E2E tests
        run: |
          cd src
          npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: src/playwright-report/
```

## トラブルシューティング

### テストが失敗する場合

1. **スクリーンショットを確認**
   - `test-results/`ディレクトリに保存される
   - 失敗時の画面状態を確認できる

2. **トレースを確認**
   - `npx playwright show-trace <trace-file>`でトレースを確認
   - テストの実行過程を詳細に確認できる

3. **ログを確認**
   - コンソールログやネットワークリクエストを確認

### タイムアウトエラー

- `playwright.config.ts`の`timeout`設定を調整
- 特定のテストのタイムアウトを延長: `test.setTimeout(60000)`

### 要素が見つからない

- セレクターが正しいか確認
- 要素が表示されるまで待機する処理を追加
- `waitForSelector`を使用

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-test)

