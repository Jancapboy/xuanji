import type { KnowledgeGraph, KnowledgeEntry, SearchResult } from '../types/knowledge';

class KnowledgeBase {
  private graph: KnowledgeGraph = {
    entries: new Map(),
    conceptIndex: new Map(),
    tagIndex: new Map(),
    sourceIndex: new Map(),
  };
  private loaded = false;

  async load(): Promise<void> {
    // 清除之前的数据，允许重新加载（修复路径错误后重试）
    this.graph = {
      entries: new Map(),
      conceptIndex: new Map(),
      tagIndex: new Map(),
      sourceIndex: new Map(),
    };
    this.loaded = false;

    const files = ['classics.json', 'rules.json', 'cases.json'];
    let successCount = 0;
    for (const file of files) {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}knowledge/${file}`);
        if (!res.ok) {
          console.warn(`Failed to load ${file}: HTTP ${res.status}`);
          continue;
        }
        const entries: KnowledgeEntry[] = await res.json();
        for (const entry of entries) {
          this.addEntry(entry);
        }
        successCount++;
      } catch (e) {
        console.warn(`Failed to load ${file}:`, e);
      }
    }

    this.loaded = successCount > 0;
  }

  private addEntry(entry: KnowledgeEntry): void {
    this.graph.entries.set(entry.id, entry);

    // 索引标签
    for (const tag of entry.tags) {
      if (!this.graph.tagIndex.has(tag)) {
        this.graph.tagIndex.set(tag, new Set());
      }
      this.graph.tagIndex.get(tag)!.add(entry.id);
    }

    // 索引来源
    if (!this.graph.sourceIndex.has(entry.source)) {
      this.graph.sourceIndex.set(entry.source, new Set());
    }
    this.graph.sourceIndex.get(entry.source)!.add(entry.id);

    // 索引关联概念
    for (const concept of entry.relatedConcepts) {
      if (!this.graph.conceptIndex.has(concept)) {
        this.graph.conceptIndex.set(concept, new Set());
      }
      this.graph.conceptIndex.get(concept)!.add(entry.id);
    }
  }

  search(query: string, limit = 5): SearchResult[] {
    const keywords = query.split(/\s+/).filter(Boolean);
    const scores = new Map<string, number>();
    const matchedFields = new Map<string, string[]>();

    for (const [id, entry] of this.graph.entries) {
      let score = 0;
      const fields: string[] = [];

      for (const kw of keywords) {
        const lowerKw = kw.toLowerCase();

        if (entry.title.includes(kw) || entry.title.toLowerCase().includes(lowerKw)) {
          score += 3;
          fields.push('title');
        }
        if (entry.content.includes(kw) || entry.content.toLowerCase().includes(lowerKw)) {
          score += 2;
          fields.push('content');
        }
        if (entry.tags.some(t => t.includes(kw) || t.toLowerCase().includes(lowerKw))) {
          score += 2.5;
          fields.push('tags');
        }
        if (entry.source.includes(kw)) {
          score += 1;
          fields.push('source');
        }
      }

      if (score > 0) {
        scores.set(id, (scores.get(id) || 0) + score);
        matchedFields.set(id, [...new Set([...(matchedFields.get(id) || []), ...fields])]);
      }
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, score]) => ({
        entry: this.graph.entries.get(id)!,
        relevance: Math.min(score / 10, 1),
        matchedFields: matchedFields.get(id) || [],
      }));
  }

  searchByTags(tags: string[], limit = 5): SearchResult[] {
    const resultIds = new Set<string>();
    for (const tag of tags) {
      const ids = this.graph.tagIndex.get(tag);
      if (ids) {
        for (const id of ids) resultIds.add(id);
      }
    }
    return Array.from(resultIds)
      .slice(0, limit)
      .map(id => ({
        entry: this.graph.entries.get(id)!,
        relevance: 1,
        matchedFields: ['tags'],
      }));
  }

  getEntry(id: string): KnowledgeEntry | undefined {
    return this.graph.entries.get(id);
  }

  getAllEntries(): KnowledgeEntry[] {
    return Array.from(this.graph.entries.values());
  }

  getEntriesByCategory(category: string): KnowledgeEntry[] {
    return this.getAllEntries().filter(e => e.category === category);
  }
}

export const knowledgeBase = new KnowledgeBase();
