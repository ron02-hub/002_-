/**
 * メディアファイル（音声・動画）の管理
 */

export interface MediaFile {
  id: string;
  name: string;
  description?: string;
  filePath: string;
  duration?: number;
  category: string;
  metadata?: Record<string, unknown>;
}

/**
 * 指定されたディレクトリから動画ファイルを読み込む
 */
export const MOVIE_DIRECTORY = '/Users/ry/Documents/06_Cursor/999_data/Movie';

export const MEDIA_FILES: MediaFile[] = [
  {
    id: 'sample-1',
    name: 'NBox 走行音なし',
    description: '走行音なしの状態',
    filePath: '/Users/ry/Documents/06_Cursor/999_data/Movie/01_NBox_走行音なし.mp4',
    category: 'baseline',
    metadata: {
      type: 'video',
      format: 'mp4',
    },
  },
  {
    id: 'sample-2',
    name: 'NBox ALTO',
    description: 'ALTO走行音',
    filePath: '/Users/ry/Documents/06_Cursor/999_data/Movie/02_NBox_ALTO.mp4',
    category: 'alto',
    metadata: {
      type: 'video',
      format: 'mp4',
    },
  },
  {
    id: 'sample-3',
    name: 'NBox Model3',
    description: 'Model3走行音',
    filePath: '/Users/ry/Documents/06_Cursor/999_data/Movie/03_NBox_Model3.mp4',
    category: 'model3',
    metadata: {
      type: 'video',
      format: 'mp4',
    },
  },
  {
    id: 'sample-4',
    name: 'NBox Fit',
    description: 'Fit走行音',
    filePath: '/Users/ry/Documents/06_Cursor/999_data/Movie/04_NBox_Fit.mp4',
    category: 'fit',
    metadata: {
      type: 'video',
      format: 'mp4',
    },
  },
  {
    id: 'sample-5',
    name: 'NBox Ferrari',
    description: 'Ferrari走行音',
    filePath: '/Users/ry/Documents/06_Cursor/999_data/Movie/05_NBox_Ferrari.mp4',
    category: 'ferrari',
    metadata: {
      type: 'video',
      format: 'mp4',
    },
  },
  {
    id: 'sample-6',
    name: 'NBox Prius',
    description: 'Prius走行音',
    filePath: '/Users/ry/Documents/06_Cursor/999_data/Movie/06_NBox_Prius.mp4',
    category: 'prius',
    metadata: {
      type: 'video',
      format: 'mp4',
    },
  },
];

/**
 * ファイルパスをWebでアクセス可能なURLに変換
 * 開発環境では、Next.jsのAPIルート経由でファイルを配信
 */
export function getMediaUrl(filePath: string): string {
  // 開発環境では、APIルート経由でファイルを配信
  if (filePath.startsWith('/Users/')) {
    // ファイル名を抽出
    const fileName = filePath.split('/').pop() || '';
    return `/api/media/files/${encodeURIComponent(fileName)}`;
  }
  // 既にURLの場合はそのまま返す
  return filePath;
}

/**
 * メディアタイプを判定
 */
export function getMediaType(filePath: string): 'audio' | 'video' {
  const ext = filePath.toLowerCase().split('.').pop();
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
  return videoExts.includes(ext || '') ? 'video' : 'audio';
}

