import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVideoPlayerOptions {
  onEnd?: () => void;
  onLoad?: () => void;
  onError?: (error: unknown) => void;
  volume?: number;
}

interface UseVideoPlayerReturn {
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
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function useVideoPlayer(
  src: string | null,
  options: UseVideoPlayerOptions = {}
): UseVideoPlayerReturn {
  const { onEnd, onLoad, onError, volume: initialVolume = 0.8 } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);

  // 再生位置の更新
  const updateProgress = useCallback(() => {
    if (videoRef.current && isPlaying) {
      setCurrentTime(videoRef.current.currentTime);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  // 動画要素のイベントハンドラ設定
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      setIsLoaded(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      setIsLoaded(true);
      setDuration(video.duration);
      video.volume = volume;
      onLoad?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      onEnd?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setError('動画ファイルの読み込みに失敗しました');
      onError?.(video.error);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);

    video.src = src;
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [src, volume, onLoad, onEnd, onError, updateProgress]);

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
    if (videoRef.current && isLoaded) {
      videoRef.current.play();
    }
  }, [isLoaded]);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (videoRef.current && isLoaded) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [isLoaded]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (videoRef.current) {
      videoRef.current.volume = clampedVolume;
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
    videoRef,
  };
}

