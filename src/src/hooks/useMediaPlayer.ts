import { useMemo } from 'react';
import { useAudioPlayer } from './useAudioPlayer';
import { useVideoPlayer } from './useVideoPlayer';

type MediaType = 'audio' | 'video' | 'auto';

interface UseMediaPlayerOptions {
  onEnd?: () => void;
  onLoad?: () => void;
  onError?: (error: unknown) => void;
  volume?: number;
  mediaType?: MediaType;
}

interface UseMediaPlayerReturn {
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
  mediaType: 'audio' | 'video';
  videoRef?: React.RefObject<HTMLVideoElement>;
}

/**
 * 音声・動画の両方に対応したメディアプレーヤーフック
 * ファイル拡張子から自動判定、または明示的に指定可能
 */
export function useMediaPlayer(
  src: string | null,
  options: UseMediaPlayerOptions = {}
): UseMediaPlayerReturn {
  const { mediaType: explicitType = 'auto', ...restOptions } = options;

  // ファイル拡張子からメディアタイプを判定
  const detectedType = useMemo(() => {
    if (explicitType !== 'auto') {
      return explicitType;
    }
    if (!src) return 'audio';
    
    const ext = src.toLowerCase().split('.').pop();
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    
    if (videoExts.includes(ext || '')) {
      return 'video';
    }
    if (audioExts.includes(ext || '')) {
      return 'audio';
    }
    // デフォルトは音声
    return 'audio';
  }, [src, explicitType]);

  const audioPlayer = useAudioPlayer(
    detectedType === 'audio' ? src : null,
    restOptions
  );

  const videoPlayer = useVideoPlayer(
    detectedType === 'video' ? src : null,
    restOptions
  );

  if (detectedType === 'video') {
    return {
      ...videoPlayer,
      mediaType: 'video',
      videoRef: videoPlayer.videoRef,
    };
  }

  return {
    ...audioPlayer,
    mediaType: 'audio',
  };
}

