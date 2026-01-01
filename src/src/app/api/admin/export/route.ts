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
        triads: {
          include: {
            audio1: true,
            audio2: true,
            audio3: true,
          },
        },
        constructs: true,
        interviewLogs: true,
      },
    });

    // CSV形式でエクスポート
    const csvRows: string[] = [];

    // ヘッダー
    csvRows.push(
      '回答者ID,年齢グループ,性別,運転歴,EV所有,音への感度,評価数,トライアド数,コンストラクト数,インタビュー数'
    );

    // データ行
    respondents.forEach((r) => {
      csvRows.push(
        [
          r.id,
          r.ageGroup,
          r.gender,
          r.drivingExperience,
          r.evOwnership ? 'Yes' : 'No',
          r.audioSensitivity,
          r.evaluations.length,
          r.triads.length,
          r.constructs.length,
          r.interviewLogs.length,
        ].join(',')
      );
    });

    const csv = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="survey-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'データのエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}

