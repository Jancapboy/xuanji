import { create } from 'zustand';
import { knowledgeBase } from '../knowledge';
import type { SearchResult } from '../types/knowledge';

interface KnowledgeStore {
  isLoaded: boolean;
  searchResults: SearchResult[];
  currentQuery: string;
  load: () => Promise<void>;
  search: (query: string) => void;
  searchByTags: (tags: string[]) => void;
}

export const useKnowledgeStore = create<KnowledgeStore>((set) => ({
  isLoaded: false,
  searchResults: [],
  currentQuery: '',

  load: async () => {
    await knowledgeBase.load();
    set({ isLoaded: true });
  },

  search: (query) => {
    const results = knowledgeBase.search(query);
    set({ searchResults: results, currentQuery: query });
  },

  searchByTags: (tags) => {
    const results = knowledgeBase.searchByTags(tags);
    set({ searchResults: results, currentQuery: tags.join(' ') });
  },
}));
