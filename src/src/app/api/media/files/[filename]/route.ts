import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MOVIE_DIRECTORY = '/Users/ry/Documents/06_Cursor/999_data/Movie';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);
    const filePath = join(MOVIE_DIRECTORY, decodedFilename);

    // セキュリティチェック: ディレクトリトラバーサル対策
    if (!filePath.startsWith(MOVIE_DIRECTORY)) {
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

