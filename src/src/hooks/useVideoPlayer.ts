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
  const timeUpdateIntervalRef = useRef<number | null>(null);

  // 動画要素のイベントハンドラ設定
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      // srcがnullの場合は、動画要素をクリーンアップ
      if (video) {
        video.src = '';
        video.load();
      }
      setIsLoaded(false);
      setIsLoading(false);
      return;
    }

    // すでに同じsrcが設定されている場合は、イベントハンドラのみ更新
    if (video.src && video.src.includes(src)) {
      // イベントリスナーの更新ロジック（省略可能だが安全のために）
    } else {
      setIsLoading(true);
      setError(null);
      setIsLoaded(false);
      
      // 古い動画リソースをクリーンアップ
      if (video.src) {
        video.pause();
        video.src = '';
        video.load();
      }
      
      // 新しい動画のsrcを設定
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

    // timeupdateイベントは頻繁に発火するため、throttleを実装
    let lastUpdateTime = 0;
    const THROTTLE_INTERVAL = 100; // 100msごとに更新（10fps）

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastUpdateTime >= THROTTLE_INTERVAL) {
        setCurrentTime(video.currentTime);
        lastUpdateTime = now;
      }
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
      
      let errorMessage = '動画の読み込みに失敗しました';
      
      if (video.error) {
        // より詳細なエラーメッセージを生成
        switch (video.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = '動画の読み込みが中断されました。ネットワーク接続を確認してください。';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = '動画ファイルの形式がサポートされていません。別のブラウザでお試しください。';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = '動画ファイルの形式がサポートされていません。MP4形式のファイルが必要です。';
            break;
          default:
            errorMessage = `動画の読み込みに失敗しました: ${video.error.message || '不明なエラー'}`;
        }
      } else {
        // video.errorがnullの場合、ネットワークエラーの可能性
        if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
          errorMessage = '動画ファイルが見つかりません。ファイルパスを確認してください。';
        } else if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
          errorMessage = '動画ファイルが読み込まれていません。ページを再読み込みしてください。';
        }
      }
      
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
      // イベントリスナーを削除
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      
      // 動画リソースをクリーンアップ（メモリリーク防止）
      video.pause();
      video.src = '';
      video.load();
      
      // タイマーをクリア
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, [src, onLoad, onEnd, onError, volume]);

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
