import { useState, useEffect, useCallback, useRef } from 'react';
import { Howl } from 'howler';

interface UseAudioPlayerOptions {
  onEnd?: () => void;
  onLoad?: () => void;
  onError?: (error: unknown) => void;
  volume?: number;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  duration: number;
  currentTime: number;
  progress: number;
  volume: number;
  error: string | null;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

export function useAudioPlayer(
  src: string | null,
  options: UseAudioPlayerOptions = {}
): UseAudioPlayerReturn {
  const { onEnd, onLoad, onError, volume: initialVolume = 0.8 } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [error, setError] = useState<string | null>(null);

  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);

  // 再生位置の更新
  const updateProgress = useCallback(() => {
    if (howlRef.current && isPlaying) {
      const seek = howlRef.current.seek() as number;
      setCurrentTime(seek);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  // Howlインスタンスの作成
  useEffect(() => {
    if (!src) {
      howlRef.current = null;
      setIsLoaded(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const howl = new Howl({
      src: [src],
      html5: true,
      volume: volume,
      onload: () => {
        setIsLoading(false);
        setIsLoaded(true);
        setDuration(howl.duration());
        onLoad?.();
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onEnd?.();
      },
      onplay: () => {
        setIsPlaying(true);
        rafRef.current = requestAnimationFrame(updateProgress);
      },
      onpause: () => {
        setIsPlaying(false);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      },
      onstop: () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      },
      onloaderror: (_, err) => {
        setIsLoading(false);
        setError('音声ファイルの読み込みに失敗しました');
        onError?.(err);
      },
      onplayerror: (_, err) => {
        setIsPlaying(false);
        setError('音声の再生に失敗しました');
        onError?.(err);
      },
    });

    howlRef.current = howl;

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      howl.unload();
    };
  }, [src]);

  // 再生状態が変わったら進捗更新を開始/停止
  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateProgress);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, updateProgress]);

  const play = useCallback(() => {
    if (howlRef.current && isLoaded) {
      howlRef.current.play();
    }
  }, [isLoaded]);

  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (howlRef.current && isLoaded) {
      howlRef.current.seek(time);
      setCurrentTime(time);
    }
  }, [isLoaded]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (howlRef.current) {
      howlRef.current.volume(clampedVolume);
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
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
  };
}

