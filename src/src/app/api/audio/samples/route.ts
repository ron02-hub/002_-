import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MEDIA_FILES, getMediaUrl } from '@/lib/mediaFiles';

export async function GET() {
  // 静的ファイルリストを返す関数
  const getStaticSamples = () => {
    return MEDIA_FILES.map((file) => ({
      id: file.id,
      name: file.name,
      description: file.description,
      fileUrl: getMediaUrl(file.filePath),
      duration: file.duration || 10,
      category: file.category,
      metadata: file.metadata,
      isActive: true,
      createdAt: new Date(),
    }));
  };

  try {
    // データベースから取得を試みる
    let samples: Array<{
      id: string;
      name: string;
      description?: string;
      fileUrl: string;
      duration: number;
      category: string;
      metadata?: Record<string, unknown>;
      isActive: boolean;
      createdAt: Date;
    }> = [];
    
    // データベース接続を試みる
    try {
      // Prismaクライアントが利用可能か確認
      if (!prisma) {
        console.warn('Prisma client not available, using static media files');
        return NextResponse.json(getStaticSamples());
      }

      // データベース接続を試みる
      const dbSamples = await prisma.audioSample.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Prismaの型を期待される型に変換
      samples = dbSamples.map((sample) => ({
        id: sample.id,
        name: sample.name,
        description: sample.description ?? undefined,
        fileUrl: sample.fileUrl,
        duration: sample.duration,
        category: sample.category,
        metadata: sample.metadata ? (sample.metadata as Record<string, unknown>) : undefined,
        isActive: sample.isActive,
        createdAt: sample.createdAt,
      }));
    } catch (error: unknown) {
      // データベース接続がない場合は、静的ファイルリストを使用
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : 'Unknown';
      console.warn('Database not available, using static media files:', {
        error: errorMessage,
        name: errorName,
      });
      samples = [];
    }

    // データベースにサンプルがない場合は、静的ファイルリストを使用
    if (samples.length === 0) {
      console.info('No samples in database, using static media files');
      samples = getStaticSamples();
    }

    return NextResponse.json(samples);
  } catch (error: unknown) {
    // 予期しないエラーが発生した場合も、静的ファイルリストを返す
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error fetching audio samples:', {
      error: errorMessage,
      stack: errorStack,
    });
    
    // フォールバック: 静的ファイルリストを返す
    return NextResponse.json(getStaticSamples());
  }
}

