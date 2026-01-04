# 音声ファイル配置場所

このディレクトリに以下の5つの音声ファイルを配置してください：

- `sample-a.mp3` - EV走行音サンプル A
- `sample-b.mp3` - EV走行音サンプル B
- `sample-c.mp3` - EV走行音サンプル C
- `sample-d.mp3` - EV走行音サンプル D
- `sample-e.mp3` - EV走行音サンプル E

## テスト用ダミーファイルの作成方法

### macOSの場合

```bash
# このディレクトリで実行
cd /Users/ry/Documents/06_Cursor/002_アンケート/src/public/audio/samples

# 10秒の無音MP3ファイルを作成（ffmpegが必要）
for i in a b c d e; do
  ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 10 -q:a 9 -acodec libmp3lame sample-${i}.mp3
done
```

### または、オンラインで無音ファイルを生成

1. https://www.audacityteam.org/ で無音ファイルを作成
2. 10秒の無音を生成
3. MP3形式でエクスポート
4. 5つのファイルをそれぞれ `sample-a.mp3` ～ `sample-e.mp3` として保存

### 実際の音声ファイルを使用する場合

実際のEV走行音ファイルを用意して、上記のファイル名で配置してください。

