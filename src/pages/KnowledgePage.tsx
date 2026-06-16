import { useEffect, useState } from 'react';
import { useKnowledgeStore } from '../stores/knowledgeStore';
import type { KnowledgeEntry } from '../types/knowledge';

function KnowledgeCard({ entry }: { entry: KnowledgeEntry }) {
  const confidenceColors = {
    certain: 'bg-green-100 text-green-700',
    probable: 'bg-yellow-100 text-yellow-700',
    speculative: 'bg-gray-100 text-gray-500',
  };

  const categoryLabels = {
    classic: '经典',
    rule: '规则',
    case: '案例',
    modern: '现代',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${confidenceColors[entry.confidence]}`}>
          {categoryLabels[entry.category]}
        </span>
        <span className="text-xs text-gray-400">{entry.source}</span>
      </div>
      <h3 className="font-medium text-ink mb-2">{entry.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{entry.content}</p>
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KnowledgePage() {
  const { isLoaded, searchResults, currentQuery, load, search } = useKnowledgeStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  if (!isLoaded) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>知识库加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-serif-zh text-ink mb-4">知识库</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索命理知识..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-ink text-white rounded-lg"
          >
            搜索
          </button>
        </div>
      </form>

      {currentQuery && (
        <p className="text-sm text-gray-500 mb-4">
          「{currentQuery}」的搜索结果 ({searchResults.length} 条)
        </p>
      )}

      <div className="space-y-3">
        {searchResults.map((result) => (
          <KnowledgeCard key={result.entry.id} entry={result.entry} />
        ))}
      </div>

      {currentQuery && searchResults.length === 0 && (
        <p className="text-center text-gray-400 py-10">未找到相关知识</p>
      )}
    </div>
  );
}
