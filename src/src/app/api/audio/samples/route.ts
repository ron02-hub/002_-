import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const samples = await prisma.audioSample.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(samples);
  } catch (error) {
    console.error('Error fetching audio samples:', error);
    return NextResponse.json(
      { error: '音声サンプルの取得に失敗しました' },
      { status: 500 }
    );
  }
}

