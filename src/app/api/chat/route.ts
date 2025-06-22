import { NextRequest, NextResponse } from 'next/server';
import { getBotReply } from '@/lib/openai';
import type { CharacterID } from '@/types/Character';
import type { Message } from '@/types/Message';

export async function POST(req: NextRequest) {
  try {
    const { messages, character } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '메시지 형식 오류' }, { status: 400 });
    }

    const reply = await getBotReply(messages as Message[], character as CharacterID);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('❌ API 처리 중 오류:', error);
    return NextResponse.json({ error: '서버 내부 오류' }, { status: 500 });
  }
}
