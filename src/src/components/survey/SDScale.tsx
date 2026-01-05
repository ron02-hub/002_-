'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SDScaleProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function SDScale({
  leftLabel,
  rightLabel,
  value,
  onChange,
  disabled = false,
  className,
}: SDScaleProps) {
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  const getValueLabel = (val: number): string => {
    if (val === 0) return 'どちらでもない';
    if (val < 0) return `やや${leftLabel}`;
    if (val > 0) return `やや${rightLabel}`;
    return '';
  };

  const scaleId = `sd-scale-${leftLabel}-${rightLabel}`.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className={cn('space-y-4', className)} role="group" aria-labelledby={`${scaleId}-label`}>
      <div className="flex items-center justify-between" id={`${scaleId}-label`}>
        <Label className="text-sm font-medium text-slate-700 flex-1 text-left">
          {leftLabel}
        </Label>
        <div className="flex-1 flex justify-center" aria-live="polite" aria-atomic="true">
          <span className="text-xs text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
            <span className="sr-only">現在の値: </span>
            {getValueLabel(value)}
          </span>
        </div>
        <Label className="text-sm font-medium text-slate-700 flex-1 text-right">
          {rightLabel}
        </Label>
      </div>

      <div className="relative">
        {/* スケール目盛り */}
        <div className="flex justify-between mb-2 px-1" aria-hidden="true">
          {[-3, -2, -1, 0, 1, 2, 3].map((mark) => (
            <div
              key={mark}
              className={cn(
                'w-0.5 h-3 bg-slate-300',
                mark === 0 && 'h-4 bg-slate-400'
              )}
            />
          ))}
        </div>

        {/* スライダー */}
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          min={-3}
          max={3}
          step={1}
          disabled={disabled}
          className="cursor-pointer"
          aria-label={`${leftLabel}から${rightLabel}までの評価`}
          aria-valuemin={-3}
          aria-valuemax={3}
          aria-valuenow={value}
          aria-valuetext={getValueLabel(value)}
        />

        {/* 値表示 */}
        <div className="flex justify-between mt-2 text-xs text-slate-500" aria-hidden="true">
          <span>-3</span>
          <span className="font-medium text-slate-700">0</span>
          <span>+3</span>
        </div>
      </div>
    </div>
  );
}

