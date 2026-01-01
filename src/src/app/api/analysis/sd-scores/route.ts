import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: {
        audioSample: true,
      },
    });

    // 音声サンプルごとに平均値を計算
    const audioMap = new Map<string, { scores: number[]; count: number }>();

    evaluations.forEach((eval) => {
      const sdScores = eval.sdScores as Record<string, number>;
      const audioId = eval.audioSampleId;

      if (!audioMap.has(audioId)) {
        audioMap.set(audioId, {
          scores: [0, 0, 0, 0, 0, 0, 0, 0], // 8軸
          count: 0,
        });
      }

      const data = audioMap.get(audioId)!;
      const scaleKeys = ['quiet', 'pleasant', 'premium', 'modern', 'powerful', 'safe', 'exciting', 'natural'];
      scaleKeys.forEach((key, index) => {
        data.scores[index] += sdScores[key] || 0;
      });
      data.count++;
    });

    const result = Array.from(audioMap.entries()).map(([audioId, data]) => {
      const audio = evaluations.find((e) => e.audioSampleId === audioId)?.audioSample;
      return {
        name: audio?.name || 'Unknown',
        scores: {
          quiet: data.scores[0] / data.count,
          pleasant: data.scores[1] / data.count,
          premium: data.scores[2] / data.count,
          modern: data.scores[3] / data.count,
          powerful: data.scores[4] / data.count,
          safe: data.scores[5] / data.count,
          exciting: data.scores[6] / data.count,
          natural: data.scores[7] / data.count,
        },
      };
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching SD scores:', error);
    return NextResponse.json(
      { error: 'SD法スコアの取得に失敗しました' },
      { status: 500 }
    );
  }
}

