import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  try {
    const sessionId = uuidv4();
    const respondentId = uuidv4();
    
    // ランダムに実験グループを割り当て
    const experimentGroup = Math.random() < 0.5 ? 'A' : 'B';

    const respondent = await prisma.respondent.create({
      data: {
        id: respondentId,
        sessionId,
        experimentGroup,
        ageGroup: '',
        gender: '',
        drivingExperience: 0,
        evOwnership: false,
        audioSensitivity: 3,
        consentGiven: false,
        headphoneCheck: false,
      },
    });

    return NextResponse.json({
      sessionId: respondent.sessionId,
      respondentId: respondent.id,
      experimentGroup: respondent.experimentGroup,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'セッションの作成に失敗しました' },
      { status: 500 }
    );
  }
}

