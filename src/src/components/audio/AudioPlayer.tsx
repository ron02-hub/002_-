'use client';

import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioWaveform } from './AudioWaveform';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
  onPlayComplete?: () => void;
  showVolumeControl?: boolean;
  compact?: boolean;
}

export function AudioPlayer({
  src,
  title,
  className,
  onPlayComplete,
  showVolumeControl = true,
  compact = false,
}: AudioPlayerProps) {
  const {
    isPlaying,
    isLoading,
    isLoaded,
    duration,
    currentTime,
    progress,
    volume,
    error,
    play,
    pause,
    stop,
    seek,
    setVolume,
  } = useAudioPlayer(src, {
    onEnd: onPlayComplete,
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.8);
  };

  if (error) {
    return (
      <div className={cn(
        'flex items-center justify-center p-4 bg-destructive/10 rounded-lg',
        className
      )}>
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 bg-muted rounded-lg',
        className
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          disabled={!isLoaded}
          className="h-10 w-10 rounded-full"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {title && (
          <span className="text-sm font-medium truncate flex-1">{title}</span>
        )}

        <span className="text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col gap-4 p-6 bg-card border rounded-xl shadow-sm',
      className
    )}>
      {title && (
        <h3 className="text-lg font-semibold text-center">{title}</h3>
      )}

      {/* 再生コントロール */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={stop}
          disabled={!isLoaded}
          className="h-10 w-10"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={handlePlayPause}
          disabled={!isLoaded}
          className="h-14 w-14 rounded-full"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>

        <div className="w-10" /> {/* スペーサー */}
      </div>

      {/* 波形表示 */}
      <div className="space-y-2">
        <AudioWaveform
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          className="mb-2"
        />
        <Slider
          value={[progress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          disabled={!isLoaded}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 音量コントロール */}
      {showVolumeControl && (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-24"
          />
        </div>
      )}
    </div>
  );
}

