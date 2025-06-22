import OpenAI from 'openai';
import { characterPrompts } from './characterPrompt';
import type { CharacterID } from '@/types/Character';
import type { Message } from '@/types/Message';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getBotReply(
  chatHistory: Message[],
  character: CharacterID
): Promise<string> {
  const systemPrompt = characterPrompts[character] ?? characterPrompts['butler'];

  const openaiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map((msg): { role: 'user' | 'assistant'; content: string } => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // 또는 'gpt-4' 사용 가능
      messages: openaiMessages,
      temperature: 0.8,
    });

    const reply = response.choices[0]?.message?.content;

    console.log('✅ GPT 응답:', reply); // 디버깅용

    return reply ?? '죄송합니다. 답변을 생성하지 못했어요.';
  } catch (error) {
    console.error('❌ OpenAI API 요청 실패:', error);
    console.log('✅ 현재 적용된 API 키:', process.env.OPENAI_API_KEY);
    return '죄송합니다. GPT 응답을 받아오지 못했습니다.';
  }
}
