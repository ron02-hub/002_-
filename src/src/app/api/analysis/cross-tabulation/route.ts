import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const respondents = await prisma.respondent.findMany({
      include: {
        evaluations: {
          include: {
            audioSample: true,
          },
        },
      },
    });

    // 年齢グループ × 購買意欲のクロス集計
    const ageGroups = ['20-29', '30-39', '40-49', '50-59', '60-70'];
    const purchaseLevels = ['低 (1-3)', '中 (4-5)', '高 (6-7)'];

    const crossTab: Array<{ row: string; columns: Record<string, number> }> = [];

    ageGroups.forEach((ageGroup) => {
      const columns: Record<string, number> = {};
      
      purchaseLevels.forEach((level) => {
        const [min, max] = level.includes('低') ? [1, 3] : level.includes('中') ? [4, 5] : [6, 7];
        
        const count = respondents
          .filter((r) => r.ageGroup === ageGroup)
          .flatMap((r) => r.evaluations)
          .filter((e) => e.purchaseIntent >= min && e.purchaseIntent <= max).length;

        columns[level] = count;
      });

      crossTab.push({ row: ageGroup, columns });
    });

    return NextResponse.json({ data: crossTab });
  } catch (error) {
    console.error('Error fetching cross tabulation:', error);
    return NextResponse.json(
      { error: 'クロス集計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

