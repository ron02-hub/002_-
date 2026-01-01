import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: {
        audioSample: true,
      },
    });

    // 音声サンプルごとに購買意欲の分布を計算
    const audioMap = new Map<string, { distribution: number[]; name: string }>();

    evaluations.forEach((eval) => {
      const audioId = eval.audioSampleId;
      const purchaseIntent = eval.purchaseIntent;

      if (!audioMap.has(audioId)) {
        audioMap.set(audioId, {
          distribution: [0, 0, 0, 0, 0, 0, 0], // 1-7
          name: eval.audioSample.name,
        });
      }

      const data = audioMap.get(audioId)!;
      if (purchaseIntent >= 1 && purchaseIntent <= 7) {
        data.distribution[purchaseIntent - 1]++;
      }
    });

    const result = Array.from(audioMap.values());

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching purchase intent:', error);
    return NextResponse.json(
      { error: '購買意欲データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

