import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータの作成を開始します...');

  // 動画サンプルの作成（指定ディレクトリの動画ファイルを使用）
  const audioSamples = await Promise.all([
    prisma.audioSample.upsert({
      where: { id: 'sample-1' },
      update: {},
      create: {
        id: 'sample-1',
        name: 'NBox 走行音なし',
        description: '走行音なしの状態',
        fileUrl: '/Users/ry/Documents/06_Cursor/999_data/Movie/01_NBox_走行音なし.mp4',
        duration: 10,
        category: 'baseline',
        metadata: {
          type: 'video',
          format: 'mp4',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-2' },
      update: {},
      create: {
        id: 'sample-2',
        name: 'NBox ALTO',
        description: 'ALTO走行音',
        fileUrl: '/Users/ry/Documents/06_Cursor/999_data/Movie/02_NBox_ALTO.mp4',
        duration: 10,
        category: 'alto',
        metadata: {
          type: 'video',
          format: 'mp4',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-3' },
      update: {},
      create: {
        id: 'sample-3',
        name: 'NBox Model3',
        description: 'Model3走行音',
        fileUrl: '/Users/ry/Documents/06_Cursor/999_data/Movie/03_NBox_Model3.mp4',
        duration: 10,
        category: 'model3',
        metadata: {
          type: 'video',
          format: 'mp4',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-4' },
      update: {},
      create: {
        id: 'sample-4',
        name: 'NBox Fit',
        description: 'Fit走行音',
        fileUrl: '/Users/ry/Documents/06_Cursor/999_data/Movie/04_NBox_Fit.mp4',
        duration: 10,
        category: 'fit',
        metadata: {
          type: 'video',
          format: 'mp4',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-5' },
      update: {},
      create: {
        id: 'sample-5',
        name: 'NBox Ferrari',
        description: 'Ferrari走行音',
        fileUrl: '/Users/ry/Documents/06_Cursor/999_data/Movie/05_NBox_Ferrari.mp4',
        duration: 10,
        category: 'ferrari',
        metadata: {
          type: 'video',
          format: 'mp4',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-6' },
      update: {},
      create: {
        id: 'sample-6',
        name: 'NBox Prius',
        description: 'Prius走行音',
        fileUrl: '/Users/ry/Documents/06_Cursor/999_data/Movie/06_NBox_Prius.mp4',
        duration: 10,
        category: 'prius',
        metadata: {
          type: 'video',
          format: 'mp4',
        },
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${audioSamples.length}個の動画サンプルを作成しました`);

  // テスト用管理者アカウント（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'テスト管理者',
        role: 'admin',
      },
    });
    console.log('✅ テスト管理者を作成しました:', admin.email);
  }

  console.log('🎉 シードデータの作成が完了しました！');
}

main()
  .catch((e) => {
    console.error('❌ シードデータの作成中にエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

