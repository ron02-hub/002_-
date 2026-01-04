import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MEDIA_FILES, getMediaUrl } from '@/lib/mediaFiles';

export async function GET() {
  try {
    // データベースから取得を試みる
    let samples;
    try {
      samples = await prisma.audioSample.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    } catch (error) {
      // データベース接続がない場合は、静的ファイルリストを使用
      console.warn('Database not available, using static media files');
      samples = MEDIA_FILES.map((file) => ({
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
    }

    // データベースにサンプルがない場合は、静的ファイルリストを使用
    if (samples.length === 0) {
      samples = MEDIA_FILES.map((file) => ({
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
    }

    return NextResponse.json(samples);
  } catch (error) {
    console.error('Error fetching audio samples:', error);
    // フォールバック: 静的ファイルリストを返す
    const fallbackSamples = MEDIA_FILES.map((file) => ({
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
    return NextResponse.json(fallbackSamples);
  }
}

