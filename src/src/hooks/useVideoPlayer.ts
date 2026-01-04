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
  videoRef: React.RefObject<HTMLVideoElement | null>;
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

  // 動画要素のイベントハンドラ設定
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      return;
    }

    // すでに同じsrcが設定されている場合は、イベントハンドラのみ更新
    if (video.src.includes(src)) {
      // イベントリスナーの更新ロジック（省略可能だが安全のために）
    } else {
      setIsLoading(true);
      setError(null);
      setIsLoaded(false);
      
      // 動画のsrcを設定
      video.src = src;
      video.volume = volume;
      video.load();
    }

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      setIsLoaded(true);
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        setDuration(video.duration);
      }
      video.volume = volume;
      onLoad?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnd?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setIsLoaded(false);
      setIsPlaying(false);
      const errorMessage = video.error
        ? `動画の読み込みに失敗しました: ${video.error.message || '不明なエラー'}`
        : '動画の読み込みに失敗しました';
      setError(errorMessage);
      onError?.(video.error);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    // イベントリスナーを追加
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    // クリーンアップ
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [src, onLoad, onEnd, onError]); // volumeを削除

  // 音量が変更されたときに動画要素に反映
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch((error) => {
      console.error('動画の再生に失敗しました:', error);
      setError(`動画の再生に失敗しました: ${error.message || error.name || '不明なエラー'}`);
    });
  }, []);

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
    }
  }, [isLoaded]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
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
