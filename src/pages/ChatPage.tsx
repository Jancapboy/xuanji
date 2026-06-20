import { useState, useRef, useCallback, useEffect } from 'react';
import { useChartStore } from '../stores/chartStore';
import { knowledgeBase } from '../knowledge';
import type { BaziChart } from '../types/bazi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// 构建命盘描述文本
function buildChartDescription(chart: BaziChart): string {
  const { year, month, day, hour, dayMaster, elementProfile, tenGodProfile, patterns } = chart;

  // 四柱描述
  const pillars = [
    `年柱：${year.stem}${year.branch}`,
    `月柱：${month.stem}${month.branch}`,
    `日柱：${day.stem}${day.branch}（日主：${dayMaster}）`,
    `时柱：${hour.stem}${hour.branch}`,
  ].join('，');

  // 五行力量
  const elementDesc = Object.entries(elementProfile)
    .sort((a, b) => b[1] - a[1])
    .map(([e, v]) => `${e}${v.toFixed(1)}%`)
    .join('、');

  // 十神分布（取前5）
  const topTenGods = Object.entries(tenGodProfile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tg, v]) => `${tg}${v.toFixed(1)}%`)
    .join('、');

  // 格局
  const patternDesc = patterns.length > 0 ? `格局：${patterns.join('、')}` : '';

  return [
    '【用户命盘】',
    pillars,
    `五行力量：${elementDesc}`,
    `十神分布：${topTenGods}`,
    patternDesc,
  ].filter(Boolean).join('\n');
}

// 构建系统 Prompt
function buildSystemPrompt(chartDesc: string, knowledgeContext: string): string {
  return `你是一位精通八字命理的AI助手。你的任务是基于用户的命盘信息和知识库内容，为用户提供专业、准确的命理分析。

分析原则：
1. 以用户命盘数据为基础，结合知识库中的经典理论和规则进行分析
2. 分析要有逻辑链条，不要泛泛而谈
3. 使用通俗易懂的语言，避免过于晦涩的术语堆砌
4. 保持客观中立，不制造焦虑
5. 如果知识库中没有足够信息，明确说明并给出合理的推测

${chartDesc}

${knowledgeContext ? `【相关知识库内容】\n${knowledgeContext}\n` : ''}

请基于以上信息回答用户的问题。如果涉及具体的流年、大运分析，请结合日主强弱和五行喜忌进行推理。`;
}

// 从知识库检索相关内容
async function retrieveKnowledge(query: string): Promise<string> {
  await knowledgeBase.load();
  const results = knowledgeBase.search(query, 5);

  if (results.length === 0) return '';

  return results
    .map((r, i) => {
      const e = r.entry;
      return `[${i + 1}] ${e.title}（来源：${e.source}）\n${e.content.slice(0, 300)}${e.content.length > 300 ? '...' : ''}`;
    })
    .join('\n\n');
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好，我是玄机AI助手。我已连接你的命盘数据和知识库，可以基于八字命理为你解答问题。请直接提问。',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('xuanji_deepseek_key') || import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentChart = useChartStore((s) => s.getCurrentChart());

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('xuanji_deepseek_key', key);
    setShowKeyInput(false);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const userMsg = input.trim();
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
      setLoading(true);

      // 检查 API Key
      const key = apiKey.trim();
      if (!key) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '请先配置 DeepSeek API Key。点击右上角的设置按钮输入你的 API Key。',
          },
        ]);
        setLoading(false);
        setShowKeyInput(true);
        return;
      }

      // 检查命盘
      if (!currentChart) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '你还没有排盘。请先到「排盘」页面输入出生信息，生成命盘后我才能基于你的八字进行分析。',
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        // 1. 检索知识库
        const knowledgeContext = await retrieveKnowledge(userMsg);

        // 2. 构建命盘描述
        const chartDesc = buildChartDescription(currentChart);

        // 3. 构建系统提示
        const systemPrompt = buildSystemPrompt(chartDesc, knowledgeContext);

        // 4. 准备流式请求
        const abortController = new AbortController();
        abortRef.current = abortController;

        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMsg },
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        // 5. 处理流式响应
        const reader = response.body?.getReader();
        if (!reader) throw new Error('无法读取响应流');

        // 添加一个空的 assistant 消息占位
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '', isStreaming: true },
        ]);

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  fullContent += delta;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last.role === 'assistant') {
                      return [
                        ...prev.slice(0, -1),
                        { ...last, content: fullContent, isStreaming: true },
                      ];
                    }
                    return prev;
                  });
                }
              } catch {
                // 忽略解析失败的行
              }
            }
          }
        }

        // 完成流式输出，标记为非流式
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, isStreaming: false }];
          }
          return prev;
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '（已取消生成）' },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `调用失败：${err.message}\n\n请检查：\n1. API Key 是否正确\n2. DeepSeek 服务是否正常\n3. 网络连接是否稳定`,
            },
          ]);
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [input, loading, apiKey, currentChart]
  );

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-serif-zh text-ink">AI 解读</h1>
        <div className="flex items-center gap-2">
          {currentChart ? (
            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
              已连接命盘
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
              未排盘
            </span>
          )}
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
          >
            {apiKey ? '已配置 API' : '配置 API Key'}
          </button>
        </div>
      </div>

      {/* API Key 输入 */}
      {showKeyInput && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DeepSeek API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 px-3 py-2 text-sm border rounded-md"
            />
            <button
              onClick={() => saveApiKey(apiKey)}
              className="px-3 py-2 text-sm bg-ink text-white rounded-md hover:bg-gray-800"
            >
              保存
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            你的 API Key 仅存储在本地浏览器中，不会上传到服务器。
          </p>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-ink text-white'
                  : 'bg-white text-gray-700 shadow-sm border border-gray-100'
              }`}
            >
              {msg.content}
              {msg.isStreaming && (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-gray-400 animate-pulse" />
              )}
            </div>
          </div>
        ))}
        {loading && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex justify-start">
            <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 text-sm text-gray-400">
              检索知识库、构建命盘上下文...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            currentChart
              ? '问问我关于你的命盘...'
              : '先排盘才能提问'
          }
          disabled={loading || !currentChart}
          className="flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:bg-gray-50 disabled:text-gray-400"
        />
        {loading ? (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            停止
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || !currentChart}
            className="px-4 py-2.5 bg-ink text-white rounded-lg text-sm disabled:opacity-50 hover:bg-gray-800"
          >
            发送
          </button>
        )}
      </form>
    </div>
  );
}
