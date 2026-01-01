'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurchaseIntentScaleProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const purchaseLabels = [
  { value: 1, label: '全く購入したくない' },
  { value: 2, label: 'あまり購入したくない' },
  { value: 3, label: 'どちらでもない' },
  { value: 4, label: 'やや購入したい' },
  { value: 5, label: '購入したい' },
  { value: 6, label: 'かなり購入したい' },
  { value: 7, label: '非常に購入したい' },
];

export function PurchaseIntentScale({
  value,
  onChange,
  disabled = false,
}: PurchaseIntentScaleProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          購買意欲
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          この走行音の車を購入したいと思いますか？
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value.toString()}
          onValueChange={(val) => onChange(parseInt(val))}
          disabled={disabled}
          className="space-y-3"
        >
          {purchaseLabels.map((item) => (
            <div key={item.value}>
              <RadioGroupItem
                value={item.value.toString()}
                id={`purchase-${item.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`purchase-${item.value}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors',
                  'peer-data-[state=checked]:bg-emerald-50 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:text-emerald-700',
                  'hover:bg-slate-50',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    value === item.value
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-300'
                  )}
                >
                  {value === item.value && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                </div>
                <div className="text-sm text-slate-500">({item.value}/7)</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

