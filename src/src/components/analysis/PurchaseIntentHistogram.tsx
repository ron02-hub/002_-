'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PurchaseIntentHistogramProps {
  data: Array<{
    audioName: string;
    distribution: number[]; // 1-7の分布
  }>;
  title?: string;
}

export function PurchaseIntentHistogram({ data, title = '購買意欲分布' }: PurchaseIntentHistogramProps) {
  // Recharts用のデータ形式に変換
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const result: Record<string, string | number> = {
      score: i + 1,
    };

    data.forEach((item) => {
      result[item.audioName] = item.distribution[i] || 0;
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="score" 
              label={{ value: '購買意欲スコア', position: 'insideBottom', offset: -5 }}
            />
            <YAxis label={{ value: '回答者数', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {data.map((item, index) => (
              <Bar
                key={index}
                dataKey={item.audioName}
                fill={colors[index % colors.length]}
                opacity={0.8}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

