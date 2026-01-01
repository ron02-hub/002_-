'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  className,
  showLabel = true,
  size = 'md',
}: ProgressBarProps) {
  const heightClass = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  }[size];

  return (
    <div className={cn('w-full space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 font-medium">進捗</span>
          <span className="text-slate-500 tabular-nums">{value}%</span>
        </div>
      )}
      <div className="relative w-full bg-slate-200 rounded-full overflow-hidden">
        <Progress
          value={value}
          className={cn(
            'transition-all duration-500 ease-out',
            heightClass
          )}
        />
        {/* グラデーション効果 */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-80"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

