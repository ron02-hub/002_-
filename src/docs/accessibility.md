# アクセシビリティ対応ガイド

## 📋 概要

本プロジェクトでは、WCAG 2.1 AA準拠を目標にアクセシビリティ対応を実装しています。すべてのユーザーが快適にアンケートに参加できるよう、キーボードナビゲーション、スクリーンリーダー対応、視覚的な配慮を行っています。

---

## 🎯 実装済み機能

### 1. ARIA属性の実装

#### ランドマーク
- `<header role="banner">`: ヘッダー
- `<main role="main">`: メインコンテンツ
- `<div role="group">`: 関連する要素のグループ化

#### 状態の通知
- `aria-live="polite"`: 進捗状況などの非緊急な情報
- `aria-live="assertive"`: エラーメッセージなどの緊急な情報
- `aria-atomic="true"`: 関連する情報をまとめて通知

#### フォーム要素
- `aria-required="true"`: 必須項目の明示
- `aria-invalid`: エラー状態の通知
- `aria-describedby`: 説明文やエラーメッセージとの関連付け
- `aria-label`: アイコンの説明やボタンの目的

#### メディアプレーヤー
- `aria-label`: 動画・音声の説明
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`: スライダーの値
- `aria-valuetext`: 値の読み上げ用テキスト
- `aria-pressed`: トグルボタンの状態

### 2. キーボードナビゲーション

#### スキップリンク
- メインコンテンツへのスキップリンクを実装
- フォーカス時のみ表示（`.sr-only` + `.focus:not-sr-only`）

#### フォーカス管理
- すべてのインタラクティブ要素にフォーカス可能
- フォーカスリングの表示（`focus-visible:ring-2`）
- Tab順序の最適化

#### キーボードショートカット（メディアプレーヤー）
- **スペースキー**: 再生/一時停止
- **←（左矢印）**: 10秒戻る
- **→（右矢印）**: 10秒進む
- **↑（上矢印）**: 音量を上げる
- **↓（下矢印）**: 音量を下げる
- **M**: ミュート/ミュート解除

### 3. スクリーンリーダー対応

#### 装飾的な要素の非表示
- アイコンや装飾的な要素に`aria-hidden="true"`を設定
- スクリーンリーダー専用テキスト（`.sr-only`）の実装

#### セマンティックHTML
- 適切な見出し階層（`h1`, `h2`, `h3`）
- リスト要素（`<ul>`, `<ol>`）の使用
- フォーム要素とラベルの関連付け（`htmlFor`属性）

#### エラーメッセージ
- `role="alert"`でエラーメッセージを通知
- `aria-describedby`でフォーム要素とエラーメッセージを関連付け

### 4. 視覚的な配慮

#### コントラスト比
- テキストと背景のコントラスト比を確保
- エラーメッセージは赤色で表示

#### フォーカス表示
- すべてのインタラクティブ要素にフォーカスリングを表示
- フォーカス時の視覚的フィードバック

#### 必須項目の表示
- 必須項目に`*`マークと`aria-label="必須"`を設定

---

## 🔧 実装詳細

### SurveyLayoutコンポーネント

```typescript
// スキップリンク
<a href="#main-content" className="sr-only focus:not-sr-only ...">
  メインコンテンツへスキップ
</a>

// 進捗状況の通知
<div aria-live="polite" aria-atomic="true">
  <span className="sr-only">進捗状況: </span>
  {progress}% 完了
</div>
```

### MediaPlayerコンポーネント

```typescript
// キーボードショートカット
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case ' ': handlePlayPause(); break;
      case 'ArrowLeft': seek(currentTime - 10); break;
      // ...
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [/* dependencies */]);
```

### フォーム要素

```typescript
// エラーメッセージとの関連付け
<RadioGroup
  aria-required="true"
  aria-invalid={!!errors.ageGroup}
  aria-describedby={errors.ageGroup ? 'ageGroup-error' : undefined}
>
  {/* ... */}
</RadioGroup>
{errors.ageGroup && (
  <p id="ageGroup-error" role="alert" aria-live="polite">
    {errors.ageGroup.message}
  </p>
)}
```

---

## 🧪 テスト方法

### 1. キーボードナビゲーションテスト

1. Tabキーで全要素にアクセスできるか確認
2. Enter/Spaceキーで操作できるか確認
3. フォーカスリングが表示されるか確認
4. Tab順序が論理的か確認

### 2. スクリーンリーダーテスト

#### macOS (VoiceOver)
1. `Cmd + F5`でVoiceOverを有効化
2. `Ctrl + Option + →`で要素を順番に読み上げ
3. フォーム要素のラベルが正しく読み上げられるか確認
4. エラーメッセージが適切に通知されるか確認

#### Windows (NVDA)
1. NVDAをインストール
2. `Insert + Q`で要素を読み上げ
3. フォーム要素のラベルが正しく読み上げられるか確認

### 3. コントラスト比テスト

- Chrome DevToolsのLighthouseを使用
- コントラスト比チェッカー（WebAIM Contrast Checker等）を使用

---

## 📚 参考資料

- [WCAG 2.1 ガイドライン](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [MDN: ARIA](https://developer.mozilla.org/ja/docs/Web/Accessibility/ARIA)

---

## ⚠️ 注意事項

1. **キーボードショートカット**: 入力フィールドにフォーカスがある場合は、キーボードショートカットを無効化しています。
2. **動的なコンテンツ**: `aria-live`を使用して、動的に変更されるコンテンツをスクリーンリーダーに通知します。
3. **フォーカス管理**: ページ遷移時やモーダル表示時は、適切にフォーカスを管理する必要があります。

---

## 🔄 今後の改善予定

- [ ] 動画プレーヤーの字幕機能
- [ ] 音声説明の追加
- [ ] 高コントラストモードの対応
- [ ] フォントサイズの調整機能

