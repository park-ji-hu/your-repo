'use client';

import { useEffect, useRef, useState } from 'react';

type CharacterID = 'butler' | 'tsundere' | 'wizard';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [character, setCharacter] = useState<CharacterID>('butler');
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat-messages');
    if (saved) setMessages(JSON.parse(saved));
    const savedChar = localStorage.getItem('chat-character') as CharacterID;
    if (savedChar) setCharacter(savedChar);
  }, []);

  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chat-character', character);
  }, [character]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    const updated: Message[] = [...messages, userMessage];
    setMessages(updated);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated, character }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('❌ API 오류:', err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '서버 오류가 발생했어요 😢' },
      ]);
      return;
    }

    const data = await res.json();
    const botReply: Message = { sender: 'bot', text: data.reply };
    setMessages((prev) => [...prev, botReply]);
  };

  const getBubbleClass = (msg: Message) => {
    const base = 'px-4 py-2 rounded-xl text-sm whitespace-pre-wrap max-w-[80%]';
    const isUser = msg.sender === 'user';

    const colorByChar: Record<CharacterID, string> = {
      butler: 'bg-blue-100 text-blue-900',
      tsundere: 'bg-pink-100 text-pink-900',
      wizard: 'bg-purple-100 text-purple-900',
    };

    return `${base} ${isUser ? 'bg-gray-200 ml-auto text-right' : colorByChar[character] + ' mr-auto text-left'}`;
  };

  const avatarUrl = `/characters/${character}.png`;

  return (
    <main className="min-h-screen bg-[#f9f9fa] flex flex-col items-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img
            src={avatarUrl}
            alt={character}
            className="w-16 h-16 rounded-full mb-2 border"
          />
          <h1 className="text-lg font-semibold text-gray-800">캐릭터 챗봇</h1>
        </div>

        {/* 캐릭터 선택 */}
        <div className="flex justify-center gap-2 mb-4">
          {(['butler', 'tsundere', 'wizard'] as CharacterID[]).map((char) => (
            <button
              key={char}
              onClick={() => setCharacter(char)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition ${
                character === char
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border text-gray-600'
              }`}
            >
              {char}
            </button>
          ))}
        </div>

        {/* 채팅창 */}
        <div className="bg-white rounded-xl p-4 h-[60vh] overflow-y-auto space-y-3 mb-4 border border-gray-200">
          {messages.map((msg, i) => (
            <div key={i} className={getBubbleClass(msg)}>
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="text-sm text-white bg-gray-800 px-4 py-1.5 rounded-full hover:bg-black transition"
          >
            전송
          </button>
        </div>

        {/* 초기화 버튼 */}
        <div className="text-center mt-3">
          <button
            onClick={() => {
              setMessages([]);
              localStorage.removeItem('chat-messages');
            }}
            className="text-xs text-gray-400 hover:underline"
          >
            대화 초기화
          </button>
        </div>
      </div>
    </main>
  );
}
