import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: {
        audioSample: true,
      },
    });

    if (evaluations.length === 0) {
      return NextResponse.json({
        data: {
          factors: [],
          loadings: [],
          explained_variance: [],
        },
      });
    }

    // SD法スコアを配列に変換
    const sdScores = evaluations.map((e) => {
      const scores = e.sdScores as Record<string, number>;
      return [
        scores.quiet || 0,
        scores.pleasant || 0,
        scores.premium || 0,
        scores.modern || 0,
        scores.powerful || 0,
        scores.safe || 0,
        scores.exciting || 0,
        scores.natural || 0,
      ];
    });

    // Pythonスクリプトで因子分析を実行
    try {
      const inputData = JSON.stringify({ sd_scores: sdScores });
      const { stdout } = await execAsync(
        `python3 analysis/factor_analysis.py '${inputData}'`
      );
      const result = JSON.parse(stdout);

      return NextResponse.json({ data: result });
    } catch (error) {
      console.error('Factor analysis error:', error);
      // フォールバック：簡易的な主成分分析
      return NextResponse.json({
        data: {
          factors: [],
          loadings: [],
          explained_variance: [],
          error: '因子分析に失敗しました（簡易モード）',
        },
      });
    }
  } catch (error) {
    console.error('Error in factor analysis:', error);
    return NextResponse.json(
      { error: '因子分析の実行に失敗しました' },
      { status: 500 }
    );
  }
}

