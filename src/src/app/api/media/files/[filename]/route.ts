import { NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import { join } from 'path';
import { existsSync, createReadStream } from 'fs';
import { Readable } from 'stream';

const MOVIE_DIRECTORY = '/Users/ry/Documents/06_Cursor/999_data/Movie';
const AUDIO_TEST_DIRECTORY = '/Users/ry/Documents/06_Cursor/999_data/Sound_data/999_AudioTest';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);
    
    // URLからディレクトリタイプを判定（クエリパラメータで指定可能）
    const url = new URL(request.url);
    const directoryType = url.searchParams.get('type') || 'movie';
    
    // ディレクトリを選択
    const baseDirectory = directoryType === 'audio-test' 
      ? AUDIO_TEST_DIRECTORY 
      : MOVIE_DIRECTORY;
    
    const filePath = join(baseDirectory, decodedFilename);

    console.log(`[MediaAPI] Request: ${decodedFilename}, Type: ${directoryType}, Path: ${filePath}`);

    // セキュリティチェック: ディレクトリトラバーサル対策
    if (!filePath.startsWith(baseDirectory)) {
      console.error(`[MediaAPI] Security error: path outside base directory`);
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // ファイルの存在確認
    if (!existsSync(filePath)) {
      console.error(`[MediaAPI] File not found: ${filePath}`);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // ファイル情報を取得
    const fileStat = await stat(filePath);
    const fileSize = fileStat.size;
    const range = request.headers.get('range');

    // 拡張子からContent-Typeを判定
    const ext = decodedFilename.toLowerCase().split('.').pop();
    const contentType = ext === 'mp4' 
      ? 'video/mp4' 
      : ext === 'webm'
      ? 'video/webm'
      : ext === 'mp3'
      ? 'audio/mpeg'
      : ext === 'wav'
      ? 'audio/wav'
      : ext === 'ogg'
      ? 'audio/ogg'
      : 'application/octet-stream';

    if (range) {
      // Rangeリクエストの処理 (シーク対応)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      console.log(`[MediaAPI] Range request: ${start}-${end}/${fileSize}`);

      // セキュリティチェック: 範囲の妥当性
      if (start >= fileSize || end >= fileSize) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      // ストリームを作成（必要な範囲のみ読み込む）
      const fileStream = createReadStream(filePath, { start, end });
      
      // Node.jsのReadableStreamをWeb ReadableStreamに変換
      // @ts-ignore
      const webStream = Readable.toWeb(fileStream);

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
        },
      });
    } else {
      // 通常の全件取得リクエスト
      console.log(`[MediaAPI] Full request: ${fileSize} bytes`);
      const fileStream = createReadStream(filePath);
      
      // @ts-ignore
      const webStream = Readable.toWeb(fileStream);

      return new NextResponse(webStream, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileSize.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Accept-Ranges': 'bytes',
        },
      });
    }
  } catch (error) {
    console.error('[MediaAPI] Error serving media file:', error);
    return NextResponse.json(
      { error: 'Failed to serve media file' },
      { status: 500 }
    );
  }
}

