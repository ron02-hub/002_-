import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ValueNode } from '@/components/analysis/ValueTree';

export async function GET() {
  try {
    const constructs = await prisma.construct.findMany({
      include: {
        triad: true,
      },
    });

    // コンストラクトから価値ツリーノードを生成
    const nodes: ValueNode[] = [];

    constructs.forEach((construct) => {
      // ラダリングデータから階層を構築
      const ladderUp = (construct.ladderUp as string[]) || [];
      const ladderDown = (construct.ladderDown as string[]) || [];

      // 終極価値（上位概念）
      ladderUp.forEach((value, index) => {
        nodes.push({
          id: `terminal-${construct.id}-${index}`,
          label: value,
          level: 'terminal',
          frequency: 1,
          sentiment: 0.5, // TODO: 実際の感情分析結果を使用
          parent: index > 0 ? `terminal-${construct.id}-${index - 1}` : undefined,
        });
      });

      // 手段価値（コンストラクト本体）
      nodes.push({
        id: `instrumental-${construct.id}`,
        label: construct.constructText,
        level: 'instrumental',
        frequency: 1,
        sentiment: 0,
        parent: ladderUp.length > 0 ? `terminal-${construct.id}-${ladderUp.length - 1}` : undefined,
      });

      // 機能的属性（下位概念）
      ladderDown.forEach((value, index) => {
        nodes.push({
          id: `functional-${construct.id}-${index}`,
          label: value,
          level: 'functional',
          frequency: 1,
          sentiment: -0.2,
          parent: `instrumental-${construct.id}`,
        });
      });
    });

    // 頻度を集計
    const frequencyMap = new Map<string, number>();
    nodes.forEach((node) => {
      const key = node.label;
      frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
    });

    nodes.forEach((node) => {
      node.frequency = frequencyMap.get(node.label) || 1;
    });

    return NextResponse.json({ data: nodes });
  } catch (error) {
    console.error('Error fetching value tree:', error);
    return NextResponse.json(
      { error: '価値ツリーデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}

