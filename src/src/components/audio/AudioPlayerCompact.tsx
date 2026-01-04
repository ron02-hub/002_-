'use client';

import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerCompactProps {
  src: string;
  title?: string;
  className?: string;
  onPlayComplete?: () => void;
}

export function AudioPlayerCompact({
  src,
  title,
  className,
  onPlayComplete,
}: AudioPlayerCompactProps) {
  const {
    isPlaying,
    isLoading,
    isLoaded,
    duration,
    currentTime,
    volume,
    error,
    play,
    pause,
    setVolume,
  } = useMediaPlayer(src, {
    onEnd: onPlayComplete,
    mediaType: 'auto',
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={cn('p-2 bg-destructive/10 rounded text-destructive text-xs', className)}>
        {error}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 bg-muted rounded-lg', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={isPlaying ? pause : play}
        disabled={!isLoaded}
        className="h-10 w-10 rounded-full flex-shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>

      {title && (
        <span className="text-sm font-medium truncate flex-1 min-w-0">{title}</span>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={[volume * 100]}
          onValueChange={(value) => setVolume(value[0] / 100)}
          max={100}
          step={1}
          className="w-20"
        />
      </div>

      <span className="text-xs text-muted-foreground tabular-nums flex-shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}

