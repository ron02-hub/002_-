'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SD_SCALES } from '@/types/survey';
import type { SDScores } from '@/types/survey';

interface SDRadarChartProps {
  data: Array<{
    name: string;
    scores: SDScores;
  }>;
  title?: string;
}

export function SDRadarChart({ data, title = 'SD法評価結果' }: SDRadarChartProps) {
  // Recharts用のデータ形式に変換
  const chartData = SD_SCALES.map((scale) => {
    const result: Record<string, string | number> = {
      axis: scale.rightLabel,
    };

    data.forEach((item, index) => {
      // -3 to +3 を 0 to 6 に変換
      const value = item.scores[scale.key] + 3;
      result[item.name || `音声${index + 1}`] = value;
    });

    return result;
  });

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 6]} tick={{ fontSize: 10 }} />
            {data.map((item, index) => (
              <Radar
                key={index}
                name={item.name || `音声${index + 1}`}
                dataKey={item.name || `音声${index + 1}`}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

