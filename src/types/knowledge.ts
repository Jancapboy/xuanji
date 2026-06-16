export type Confidence = 'certain' | 'probable' | 'speculative';

export type KnowledgeCategory = 'classic' | 'rule' | 'case' | 'modern';

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  source: string;
  title: string;
  content: string;
  tags: string[];
  relatedConcepts: string[];
  confidence: Confidence;
  metadata: {
    author?: string;
    dynasty?: string;
    page?: string;
    url?: string;
  };
  stats?: {
    queryCount: number;
    lastQueried: string;
  };
}

export interface KnowledgeGraph {
  entries: Map<string, KnowledgeEntry>;
  conceptIndex: Map<string, Set<string>>;
  tagIndex: Map<string, Set<string>>;
  sourceIndex: Map<string, Set<string>>;
}

export interface SearchResult {
  entry: KnowledgeEntry;
  relevance: number;
  matchedFields: string[];
}

export interface RAGContext {
  query: string;
  chartFeatures: string[];
  retrievedEntries: SearchResult[];
  assembledPrompt: string;
}
