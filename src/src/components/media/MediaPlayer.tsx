'use client';

import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioWaveform } from '../audio/AudioWaveform';
import { useMemo, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Loader2,
  Video,
  Music,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPlayerProps {
  src: string;
  title?: string;
  className?: string;
  onPlayComplete?: () => void;
  showVolumeControl?: boolean;
  compact?: boolean;
  mediaType?: 'audio' | 'video' | 'auto';
  showVideo?: boolean; // 動画の場合、動画を表示するか
}

export function MediaPlayer({
  src,
  title,
  className,
  onPlayComplete,
  showVolumeControl = true,
  compact = false,
  mediaType = 'auto',
  showVideo = true,
}: MediaPlayerProps) {
  // オプションをメモ化して再レンダリング時の不要なリロードを防止
  const options = useMemo(() => ({
    onEnd: onPlayComplete,
    mediaType,
  }), [onPlayComplete, mediaType]);

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
    mediaType: detectedType,
    videoRef,
  } = useMediaPlayer(src, options);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    console.log('再生/一時停止ボタンがクリックされました', {
      isPlaying,
      isLoaded,
      isLoading,
      error,
      mediaType: detectedType,
    });
    
    if (isPlaying) {
      pause();
    } else {
      console.log('play()関数を呼び出します');
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

  // キーボードショートカット対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // メディアプレーヤーがフォーカスされている場合のみ処理
      // 入力フィールドにフォーカスがある場合は無視
      if (
        e.target instanceof HTMLElement && 
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)
      ) {
        return;
      }

      const mediaPlayer = document.querySelector('[data-media-player]');
      if (!mediaPlayer || !mediaPlayer.contains(e.target as Node)) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isLoaded) {
            handlePlayPause();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (isLoaded && duration > 0) {
            seek(Math.max(0, currentTime - 10));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (isLoaded && duration > 0) {
            seek(Math.min(duration, currentTime + 10));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoaded, currentTime, duration, volume]);

  if (error) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center p-6 bg-destructive/10 rounded-lg border border-destructive/20',
        className
      )}>
        <AlertCircle className="w-8 h-8 text-destructive mb-3" />
        <p className="text-destructive text-sm font-medium mb-2 text-center">{error}</p>
        <p className="text-xs text-muted-foreground text-center mb-4">
          ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-xs"
        >
          ページを再読み込み
        </Button>
      </div>
    );
  }

  // 動画の場合
  if (detectedType === 'video' && videoRef) {
    if (compact) {
      return (
        <div className={cn(
          'flex items-center gap-3 p-3 bg-muted rounded-lg',
          className
        )}>
          {/* 隠しビデオ要素（コンパクトモードでも再生を可能にするため） */}
          <video
            ref={videoRef}
            className="hidden"
            playsInline
            preload="metadata"
          />
          <Button
            type="button"
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

          <Video className="w-4 h-4 text-muted-foreground" />

          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      );
    }

    return (
      <div 
        className={cn(
          'flex flex-col gap-4 p-6 bg-card border rounded-xl shadow-sm',
          className
        )}
        data-media-player
        tabIndex={0}
        role="group"
        aria-label={title || '動画プレーヤー'}
      >
        {title && (
          <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            {title}
          </h3>
        )}

        {/* 動画表示 */}
        {showVideo && (
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-96"
              playsInline
              preload="metadata"
              aria-label={title || '動画'}
              aria-describedby={title ? undefined : 'video-description'}
            />
            {title && (
              <div id="video-description" className="sr-only">
                {title}の動画プレーヤー
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50" aria-live="polite" aria-atomic="true">
                <Loader2 className="w-8 h-8 animate-spin text-white" aria-hidden="true" />
                <span className="sr-only">動画を読み込んでいます</span>
              </div>
            )}
          </div>
        )}

        {/* 再生コントロール */}
        <div className="flex items-center justify-center gap-4" role="group" aria-label="メディア再生コントロール">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={stop}
            disabled={!isLoaded}
            className="h-10 w-10"
            aria-label="停止して最初に戻る"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            type="button"
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            disabled={!isLoaded}
            className="h-14 w-14 rounded-full"
            aria-label={isPlaying ? '一時停止' : '再生'}
            aria-pressed={isPlaying}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Play className="h-6 w-6 ml-1" aria-hidden="true" />
            )}
          </Button>

          <div className="w-10" aria-hidden="true" /> {/* スペーサー */}
        </div>

        {/* プログレスバー */}
        <div className="space-y-2" role="group" aria-label="再生位置">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            disabled={!isLoaded}
            className="cursor-pointer"
            aria-label="再生位置"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums" aria-hidden="true">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 音量コントロール */}
        {showVolumeControl && (
          <div className="flex items-center gap-3" role="group" aria-label="音量コントロール">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
              aria-label={volume === 0 ? 'ミュート解除' : 'ミュート'}
              aria-pressed={volume === 0}
            >
              {volume === 0 ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24"
              aria-label="音量"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volume * 100}
              aria-valuetext={`${Math.round(volume * 100)}%`}
            />
          </div>
        )}
      </div>
    );
  }

  // 音声の場合（既存のAudioPlayerと同じUI）
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 bg-muted rounded-lg',
        className
      )}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          disabled={!isLoaded}
          className="h-10 w-10 rounded-full"
          aria-label={isPlaying ? '一時停止' : '再生'}
          aria-pressed={isPlaying}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" aria-hidden="true" />
          )}
        </Button>

        {title && (
          <span className="text-sm font-medium truncate flex-1">{title}</span>
        )}

        <Music className="w-4 h-4 text-muted-foreground" />

        <span className="text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'flex flex-col gap-4 p-6 bg-card border rounded-xl shadow-sm',
        className
      )}
      data-media-player
      tabIndex={0}
      role="group"
      aria-label={title || 'メディアプレーヤー'}
    >
      {title && (
        <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
          <Music className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          {title}
        </h3>
      )}

      {/* 再生コントロール */}
      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={stop}
          disabled={!isLoaded}
          className="h-10 w-10"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          type="button"
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
            type="button"
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

