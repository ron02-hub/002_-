'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WillingnessToPayScaleProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const wtpOptions = [
  { value: 0, label: '0円（追加では支払いたくない）' },
  { value: 10000, label: '1万円' },
  { value: 30000, label: '3万円' },
  { value: 50000, label: '5万円' },
  { value: 100000, label: '10万円' },
  { value: 200000, label: '20万円' },
  { value: 300000, label: '30万円以上' },
];

export function WillingnessToPayScale({
  value,
  onChange,
  disabled = false,
}: WillingnessToPayScaleProps) {
  return (
    <Card className="bg-white shadow-sm border-amber-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Banknote className="w-5 h-5 text-amber-600" />
          価格受容性（追加支払意欲）
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          もしこの走行音が「理想的」である場合、標準価格（200万円）に加えて、
          最大でいくらまでなら「追加料金」を払っても良いと思いますか？
        </p>
        <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800 border border-amber-100">
          ※ 良い音にするためのオプション料金としてお考えください。
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value.toString()}
          onValueChange={(val) => onChange(parseInt(val))}
          disabled={disabled}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          aria-label="価格受容性の評価"
          aria-required="true"
        >
          {wtpOptions.map((item) => (
            <div key={item.value}>
              <RadioGroupItem
                value={item.value.toString()}
                id={`wtp-${item.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`wtp-${item.value}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors h-full',
                  'peer-data-[state=checked]:bg-amber-50 peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:text-amber-700',
                  'hover:bg-slate-50 focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0',
                    value === item.value
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-slate-300'
                  )}
                >
                  {value === item.value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.label}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

