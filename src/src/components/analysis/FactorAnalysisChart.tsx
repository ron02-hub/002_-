'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FactorAnalysisChartProps {
  data: Array<{
    name: string;
    loadings: Array<{
      scale: string;
      loading: number;
    }>;
  }>;
  title?: string;
}

export function FactorAnalysisChart({ data, title = '因子分析結果' }: FactorAnalysisChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">データがありません</p>
        </CardContent>
      </Card>
    );
  }

  // Recharts用のデータ形式に変換
  const chartData = data[0]?.loadings.map((loading) => {
    const result: Record<string, string | number> = {
      scale: loading.scale,
    };

    data.forEach((factor) => {
      const loadingData = factor.loadings.find((l) => l.scale === loading.scale);
      result[factor.name] = loadingData?.loading || 0;
    });

    return result;
  }) || [];

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
            <XAxis dataKey="scale" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: '因子負荷量', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {data.map((factor, index) => (
              <Bar
                key={index}
                dataKey={factor.name}
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

