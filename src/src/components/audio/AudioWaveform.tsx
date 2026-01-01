'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  className?: string;
  barCount?: number;
}

export function AudioWaveform({
  isPlaying,
  currentTime,
  duration,
  className,
  barCount = 40,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / barCount;
    const gap = barWidth * 0.2;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = duration > 0 ? currentTime / duration : 0;

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const isActive = i / barCount < progress;

        // アニメーション効果（再生中のみ）
        const baseHeight = height * 0.3;
        const maxHeight = height * 0.9;
        let barHeight = baseHeight;

        if (isPlaying) {
          // ランダムな高さでアニメーション
          const randomFactor = 0.5 + Math.random() * 0.5;
          barHeight = baseHeight + (maxHeight - baseHeight) * randomFactor;
        } else if (isActive) {
          // 再生済み部分は固定高さ
          barHeight = baseHeight + (maxHeight - baseHeight) * 0.6;
        }

        // グラデーション色
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (isActive) {
          gradient.addColorStop(0, '#10b981'); // emerald-500
          gradient.addColorStop(1, '#06b6d4'); // cyan-500
        } else {
          gradient.addColorStop(0, '#cbd5e1'); // slate-300
          gradient.addColorStop(1, '#94a3b8'); // slate-400
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(
          x + gap / 2,
          (height - barHeight) / 2,
          barWidth - gap,
          barHeight
        );
      }
    };

    draw();

    if (isPlaying) {
      const animate = () => {
        draw();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className={cn('w-full h-15 rounded-lg', className)}
    />
  );
}

