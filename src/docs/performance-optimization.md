# パフォーマンス最適化ガイド

## 概要

本ドキュメントでは、動画再生機能のパフォーマンス最適化とメモリリーク対策について説明します。

## 実装された最適化

### 1. メモリリーク対策

#### 動画要素のクリーンアップ
- コンポーネントのアンマウント時やsrc変更時に、動画要素のリソースを適切に解放
- `video.pause()`, `video.src = ''`, `video.load()`を実行してメモリを解放

```typescript
// クリーンアップ処理
return () => {
  video.pause();
  video.src = '';
  video.load();
};
```

#### イベントリスナーの削除
- すべてのイベントリスナーを適切に削除してメモリリークを防止

### 2. CPU使用率の最適化

#### timeupdateイベントのthrottle
- `timeupdate`イベントは通常1秒に数回発火するため、CPU使用率が高くなる可能性がある
- 100ms間隔（10fps）で更新を制限することで、CPU負荷を軽減

```typescript
const THROTTLE_INTERVAL = 100; // 100msごとに更新

const handleTimeUpdate = () => {
  const now = Date.now();
  if (now - lastUpdateTime >= THROTTLE_INTERVAL) {
    setCurrentTime(video.currentTime);
    lastUpdateTime = now;
  }
};
```

### 3. パフォーマンス監視

#### 推奨される監視項目

1. **メモリ使用量**
   - Chrome DevToolsのPerformanceタブでメモリプロファイルを確認
   - 長時間使用後のメモリ増加を確認

2. **CPU使用率**
   - Chrome DevToolsのPerformanceタブでCPUプロファイルを確認
   - 動画再生中のCPU使用率を確認

3. **ネットワーク使用量**
   - Chrome DevToolsのNetworkタブで動画ファイルの読み込み状況を確認
   - ストリーミングの効率を確認

## パフォーマンステスト手順

### 1. メモリリークテスト

```bash
# Chrome DevToolsを使用
1. Chrome DevToolsを開く（F12）
2. Performanceタブを開く
3. "Record"ボタンをクリック
4. 動画を複数回再生・停止を繰り返す
5. "Stop"ボタンをクリック
6. Memoryタブでメモリ使用量の推移を確認
```

**期待される結果**: メモリ使用量が一定範囲内で推移し、継続的に増加しない

### 2. CPU使用率テスト

```bash
# Chrome DevToolsを使用
1. Chrome DevToolsを開く（F12）
2. Performanceタブを開く
3. "Record"ボタンをクリック
4. 動画を再生中に10秒間記録
5. "Stop"ボタンをクリック
6. CPU使用率のグラフを確認
```

**期待される結果**: 動画再生中でもCPU使用率が適切な範囲内（50%以下推奨）

### 3. 長時間動作テスト

```bash
# 以下の手順で長時間動作をテスト
1. アンケートを開始
2. 複数の動画を連続して再生
3. 30分以上継続して使用
4. メモリ使用量とCPU使用率を定期的に確認
```

**期待される結果**: 長時間使用後もパフォーマンスが劣化しない

## トラブルシューティング

### メモリリークが発生する場合

1. **動画要素のクリーンアップを確認**
   - `useVideoPlayer`フックのクリーンアップ処理が正しく実行されているか確認
   - コンポーネントのアンマウント時に動画要素が適切にクリーンアップされているか確認

2. **イベントリスナーの削除を確認**
   - すべてのイベントリスナーが`removeEventListener`で削除されているか確認

3. **動画ファイルのサイズを確認**
   - 大きな動画ファイル（100MB以上）は、メモリ使用量が増加する可能性がある
   - 必要に応じて動画ファイルを圧縮

### CPU使用率が高い場合

1. **timeupdateイベントのthrottleを確認**
   - 現在100ms間隔で更新しているが、必要に応じて間隔を調整（200msなど）

2. **動画の解像度を確認**
   - 高解像度の動画（4Kなど）はCPU使用率が高くなる
   - 必要に応じて解像度を下げる

3. **同時再生の数を確認**
   - 複数の動画を同時に再生するとCPU使用率が高くなる
   - 同時再生を避ける

## ベストプラクティス

1. **動画ファイルの最適化**
   - 適切なビットレートと解像度を設定
   - H.264コーデックを使用（互換性が高い）

2. **プリロードの制御**
   - `preload="metadata"`を使用して、必要最小限のデータのみ読み込む

3. **リソースの適切な管理**
   - 使用しない動画要素は即座にクリーンアップ
   - コンポーネントのアンマウント時に必ずクリーンアップ処理を実行

4. **パフォーマンス監視の継続**
   - 定期的にパフォーマンステストを実施
   - 問題が発生した場合は即座に対応

## 参考資料

- [MDN: HTMLVideoElement](https://developer.mozilla.org/ja/docs/Web/API/HTMLVideoElement)
- [Chrome DevTools: Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React: useEffect cleanup](https://react.dev/reference/react/useEffect#cleanup)

