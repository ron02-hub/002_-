import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const evaluationSchema = z.object({
  respondentId: z.string(),
  audioSampleId: z.string(),
  presentationOrder: z.number(),
  sdScores: z.object({
    quiet: z.number(),
    pleasant: z.number(),
    premium: z.number(),
    modern: z.number(),
    powerful: z.number(),
    safe: z.number(),
    exciting: z.number(),
    natural: z.number(),
  }),
  purchaseIntent: z.number().min(1).max(7),
  willingnessToPay: z.number().optional(),
  freeText: z.string().optional(),
  responseTimeMs: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = evaluationSchema.parse(body);

    const evaluation = await prisma.evaluation.create({
      data: {
        respondentId: data.respondentId,
        audioSampleId: data.audioSampleId,
        presentationOrder: data.presentationOrder,
        sdScores: data.sdScores,
        purchaseIntent: data.purchaseIntent,
        willingnessToPay: data.willingnessToPay,
        freeText: data.freeText,
        responseTimeMs: data.responseTimeMs,
      },
    });

    return NextResponse.json({ success: true, evaluationId: evaluation.id });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    return NextResponse.json(
      { error: '評価の保存に失敗しました' },
      { status: 500 }
    );
  }
}

