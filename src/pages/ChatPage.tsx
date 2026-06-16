import { useState } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: '你好，我是玄机AI助手。你可以问我关于命理、八字的问题，我会基于知识库为你解答。' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // MVP 阶段：模拟 AI 回复
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `我理解了你的问题。MVP 阶段暂不支持实时 AI 对话，后续版本将接入 Kimi API 提供基于知识库的解读。\n\n你可以先到「知识库」页面搜索相关内容。`,
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-2xl font-serif-zh text-ink mb-4">AI 解读</h1>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-ink text-white'
                  : 'bg-white text-gray-700 shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm text-sm text-gray-400">
              思考中...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-ink text-white rounded-lg disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
