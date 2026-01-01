import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // 自由記述テキストを取得
    const evaluations = await prisma.evaluation.findMany({
      where: {
        freeText: {
          not: null,
        },
      },
      select: {
        freeText: true,
      },
    });

    const freeTexts = evaluations
      .map((e) => e.freeText)
      .filter((text): text is string => text !== null && text.length > 0);

    if (freeTexts.length === 0) {
      return NextResponse.json({
        data: {
          keywords: [],
          average_sentiment: 0,
          total_texts: 0,
          analyzed_texts: 0,
        },
      });
    }

    // Pythonスクリプトを実行
    try {
      const inputData = JSON.stringify({ free_texts: freeTexts });
      const { stdout } = await execAsync(
        `python3 analysis/nlp_analysis.py '${inputData}'`
      );
      const result = JSON.parse(stdout);

      return NextResponse.json({ data: result });
    } catch (error) {
      console.error('Python analysis error:', error);
      // フォールバック：簡易分析
      return NextResponse.json({
        data: {
          keywords: [],
          average_sentiment: 0,
          total_texts: freeTexts.length,
          analyzed_texts: 0,
          error: 'NLP分析に失敗しました（簡易モード）',
        },
      });
    }
  } catch (error) {
    console.error('Error in NLP analysis:', error);
    return NextResponse.json(
      { error: 'NLP分析の実行に失敗しました' },
      { status: 500 }
    );
  }
}

