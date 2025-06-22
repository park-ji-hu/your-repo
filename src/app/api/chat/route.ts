// ✅ 환경 변수를 Edge Runtime에서 읽을 수 없기 때문에 nodejs로 강제 설정
export const runtime = 'nodejs';

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

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY 환경 변수가 없습니다.');
      return NextResponse.json({ error: '서버 설정 오류: OPENAI 키 없음' }, { status: 500 });
    }

    const reply = await getBotReply(messages as Message[], character as CharacterID);
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('❌ 서버 오류:', err);
    return NextResponse.json({ error: '서버 처리 중 오류 발생' }, { status: 500 });
  }
}
