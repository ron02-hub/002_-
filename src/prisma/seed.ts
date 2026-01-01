import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータの作成を開始します...');

  // 音声サンプルの作成
  const audioSamples = await Promise.all([
    prisma.audioSample.upsert({
      where: { id: 'sample-1' },
      update: {},
      create: {
        id: 'sample-1',
        name: 'EV走行音サンプル A',
        description: '低音が響く重厚感のある走行音',
        fileUrl: '/audio/samples/sample-a.mp3',
        duration: 10,
        category: 'luxury',
        metadata: {
          frequency: 'low',
          character: 'heavy',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-2' },
      update: {},
      create: {
        id: 'sample-2',
        name: 'EV走行音サンプル B',
        description: '高音が目立つ軽快な走行音',
        fileUrl: '/audio/samples/sample-b.mp3',
        duration: 10,
        category: 'sport',
        metadata: {
          frequency: 'high',
          character: 'light',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-3' },
      update: {},
      create: {
        id: 'sample-3',
        name: 'EV走行音サンプル C',
        description: 'バランスの取れた中性的な走行音',
        fileUrl: '/audio/samples/sample-c.mp3',
        duration: 10,
        category: 'standard',
        metadata: {
          frequency: 'mid',
          character: 'balanced',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-4' },
      update: {},
      create: {
        id: 'sample-4',
        name: 'EV走行音サンプル D',
        description: '静粛性を重視した控えめな走行音',
        fileUrl: '/audio/samples/sample-d.mp3',
        duration: 10,
        category: 'quiet',
        metadata: {
          frequency: 'very-low',
          character: 'subtle',
        },
        isActive: true,
      },
    }),
    prisma.audioSample.upsert({
      where: { id: 'sample-5' },
      update: {},
      create: {
        id: 'sample-5',
        name: 'EV走行音サンプル E',
        description: '未来感のある電子音的な走行音',
        fileUrl: '/audio/samples/sample-e.mp3',
        duration: 10,
        category: 'futuristic',
        metadata: {
          frequency: 'mid-high',
          character: 'electronic',
        },
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${audioSamples.length}個の音声サンプルを作成しました`);

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

