'use client';

import { SDScale } from './SDScale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SD_SCALES, type SDScores } from '@/types/survey';
import { Volume2 } from 'lucide-react';

interface SDScaleFormProps {
  scores: SDScores;
  onChange: (scores: SDScores) => void;
  disabled?: boolean;
}

export function SDScaleForm({ scores, onChange, disabled = false }: SDScaleFormProps) {
  const handleScaleChange = (key: keyof SDScores, value: number) => {
    onChange({
      ...scores,
      [key]: value,
    });
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Volume2 className="w-5 h-5 text-emerald-600" />
          印象評価
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          この走行音を聞いて、以下の9つの項目について評価してください。
          スライダーを動かして、あなたの印象に最も近い位置を選択してください。
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {SD_SCALES.map((scale) => (
          <SDScale
            key={scale.key}
            leftLabel={scale.leftLabel}
            rightLabel={scale.rightLabel}
            value={scores[scale.key]}
            onChange={(value) => handleScaleChange(scale.key, value)}
            disabled={disabled}
          />
        ))}
      </CardContent>
    </Card>
  );
}

