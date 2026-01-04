import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // セキュリティチェック: ディレクトリトラバーサル対策
    if (!filePath.startsWith(baseDirectory)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // ファイルの存在確認
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // ファイルを読み込む
    const fileBuffer = await readFile(filePath);
    
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

    // ファイルを返す
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving media file:', error);
    return NextResponse.json(
      { error: 'Failed to serve media file' },
      { status: 500 }
    );
  }
}

