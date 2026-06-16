# DEV_SPEC — 玄机 (XuanJi) · AI 命理分析系统

> **版本**: v0.1.0-MVP  
> **对应 PRD**: `PRD.md`  
> **技术栈**: React 18 + Vite + TypeScript + Tailwind + Zustand + IndexedDB + D3.js

---

## 1. 项目结构

```
mingli-ai/
├── docs/
│   ├── PRD.md              # 产品需求文档
│   └── DEV_SPEC.md         # 本文件
├── public/
│   └── knowledge/          # 知识库静态数据（JSON）
│       ├── classics.json
│       ├── rules.json
│       └── cases.json
├── src/
│   ├── main.tsx            # 入口
│   ├── App.tsx             # 根组件
│   ├── index.css           # 全局样式
│   │
│   ├── types/              # 全局类型定义
│   │   ├── bazi.ts         # 八字相关类型
│   │   ├── ziwei.ts        # 紫微相关类型
│   │   ├── knowledge.ts    # 知识库类型
│   │   └── common.ts       # 通用类型
│   │
│   ├── data/               # 静态数据
│   │   ├── stems.ts        # 天干数据
│   │   ├── branches.ts     # 地支数据
│   │   ├── elements.ts     # 五行数据
│   │   └── stars.ts        # 星曜数据
│   │
│   ├── core/               # 核心算法（纯函数，无副作用）
│   │   ├── bazi/           # 八字排盘引擎
│   │   │   ├── calculator.ts   # 四柱计算
│   │   │   ├── tenGods.ts      # 十神推算
│   │   │   ├── elements.ts     # 五行力量计算
│   │   │   └── patterns.ts     # 格局判断
│   │   ├── ziwei/          # 紫微排盘引擎（v0.2）
│   │   └── lunar/          # 历法转换
│   │
│   ├── knowledge/          # 知识库系统（核心）
│   │   ├── index.ts        # 知识库入口
│   │   ├── loader.ts       # 数据加载
│   │   ├── search.ts       # 检索引擎（关键词索引）
│   │   ├── graph.ts        # 知识图谱关系
│   │   └── rag.ts          # RAG 上下文组装
│   │
│   ├── stores/             # Zustand 状态管理
│   │   ├── chartStore.ts   # 命盘状态
│   │   ├── knowledgeStore.ts # 知识库状态
│   │   ├── chatStore.ts    # 对话状态
│   │   └── userStore.ts    # 用户设置
│   │
│   ├── services/           # 外部服务
│   │   └── ai.ts           # Kimi API 封装
│   │
│   ├── components/         # 组件（按功能域分组）
│   │   ├── layout/         # 布局组件
│   │   ├── bazi/           # 八字可视化
│   │   ├── common/         # 通用组件
│   │   └── chat/           # 对话组件
│   │
│   ├── pages/              # 页面级组件
│   │   ├── HomePage.tsx
│   │   ├── ChartPage.tsx
│   │   ├── KnowledgePage.tsx
│   │   └── ChatPage.tsx
│   │
│   ├── hooks/              # 自定义 Hooks
│   ├── utils/              # 工具函数
│   └── db/                 # IndexedDB 封装
│       └── index.ts
│
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── .github/workflows/
    └── deploy.yml          # GitHub Pages 自动部署
```

---

## 2. 类型系统

### 2.1 八字核心类型

```typescript
// src/types/bazi.ts

/** 天干 */
type Stem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/** 地支 */
type Branch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 五行 */
type Element = '木' | '火' | '土' | '金' | '水';

/** 阴阳 */
type Polarity = '阳' | '阴';

/** 十神 */
type TenGod = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印';

/** 一柱（天干+地支） */
interface Pillar {
  stem: Stem;
  branch: Branch;
  hiddenStems: Array<{ stem: Stem; percentage: number }>; // 藏干及占比
  tenGod?: TenGod; // 相对于日主的十神
}

/** 四柱命盘 */
interface BaziChart {
  year: Pillar;   // 年柱
  month: Pillar;  // 月柱
  day: Pillar;    // 日柱（日主）
  hour: Pillar;   // 时柱
  dayMaster: Stem; // 日主天干
  elementProfile: Record<Element, number>; // 五行力量分布
  tenGodProfile: Record<TenGod, number>;   // 十神力量分布
  patterns: string[]; // 识别出的格局
}

/** 出生信息 */
interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;      // 0-23
  minute: number;
  gender: '男' | '女';
  timezone: number;  // UTC 偏移，如 +8
  location?: string; // 出生地，用于真太阳时
}
```

### 2.2 知识库类型

```typescript
// src/types/knowledge.ts

/** 知识可信度 */
type Confidence = 'certain' | 'probable' | 'speculative';

/** 知识分类 */
type KnowledgeCategory = 'classic' | 'rule' | 'case' | 'modern';

/** 知识条目 */
interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  source: string;           // 来源典籍/文献名
  title: string;
  content: string;
  tags: string[];           // 检索标签
  relatedConcepts: string[]; // 关联概念 ID
  confidence: Confidence;
  metadata: {
    author?: string;
    dynasty?: string;
    page?: string;
    url?: string;
  };
  // 使用统计
  stats?: {
    queryCount: number;
    lastQueried: string;
  };
}

/** 知识图谱 */
interface KnowledgeGraph {
  entries: Map<string, KnowledgeEntry>;
  conceptIndex: Map<string, Set<string>>; // conceptId -> entryIds
  tagIndex: Map<string, Set<string>>;     // tag -> entryIds
  sourceIndex: Map<string, Set<string>>;  // source -> entryIds
}

/** 检索结果 */
interface SearchResult {
  entry: KnowledgeEntry;
  relevance: number; // 0-1
  matchedFields: string[]; // 匹配到的字段
}

/** RAG 上下文 */
interface RAGContext {
  query: string;
  chartFeatures: string[]; // 命盘特征关键词
  retrievedEntries: SearchResult[];
  assembledPrompt: string;
}
```

### 2.3 对话类型

```typescript
// src/types/chat.ts

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  // AI 消息的引用来源
  citations?: Array<{
    entryId: string;
    title: string;
    quote: string;
  }>;
  // 命盘上下文（对话绑定的命盘）
  chartId?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  chartId?: string; // 关联的命盘
}
```

---

## 3. 核心算法规范

### 3.1 八字排盘计算

```typescript
// src/core/bazi/calculator.ts

/**
 * 根据出生信息计算四柱
 * 
 * 算法步骤：
 * 1. 真太阳时校正（如提供出生地）
 * 2. 年柱：以立春为界，不是农历正月初一
 * 3. 月柱：以节气为界（月支固定，月干按年干推算）
 * 4. 日柱：查万年历/公式计算
 * 5. 时柱：时支固定（2小时一支），时干按日干推算
 */
export function calculateBazi(birth: BirthInfo): BaziChart;

/**
 * 计算十神
 * @param dayMaster 日主天干
 * @param targetStem 目标天干
 */
export function calculateTenGod(dayMaster: Stem, targetStem: Stem): TenGod;

/**
 * 计算五行力量
 * 考虑：天干本气 + 地支本气 + 藏干 + 月令旺衰
 */
export function calculateElementStrength(chart: BaziChart): Record<Element, number>;

/**
 * 识别格局
 * 常见格局：正官格、七杀格、正印格、食神格等
 */
export function identifyPatterns(chart: BaziChart): string[];
```

### 3.2 知识库检索

```typescript
// src/knowledge/search.ts

/**
 * 多字段检索
 * @param query 查询字符串
 * @param chartFeatures 命盘特征（用于增强检索）
 * @param limit 返回条数上限
 */
export function searchKnowledge(
  graph: KnowledgeGraph,
  query: string,
  chartFeatures?: string[],
  limit?: number
): SearchResult[];

/**
 * 基于命盘特征的自动检索
 * 自动提取命盘关键词，检索相关知识
 */
export function autoRetrieveForChart(
  graph: KnowledgeGraph,
  chart: BaziChart
): SearchResult[];
```

---

## 4. 状态管理（Zustand）

### 4.1 chartStore

```typescript
interface ChartStore {
  // 状态
  charts: BaziChart[];          // 所有命盘
  currentChartId: string | null;
  
  // Actions
  addChart: (chart: BaziChart) => void;
  removeChart: (id: string) => void;
  setCurrentChart: (id: string) => void;
  getCurrentChart: () => BaziChart | null;
}
```

### 4.2 knowledgeStore

```typescript
interface KnowledgeStore {
  // 状态
  graph: KnowledgeGraph;
  isLoaded: boolean;
  
  // Actions
  loadKnowledge: () => Promise<void>;
  search: (query: string) => SearchResult[];
  getEntryById: (id: string) => KnowledgeEntry | undefined;
  
  // 统计
  incrementQueryCount: (entryId: string) => void;
}
```

### 4.3 chatStore

```typescript
interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  
  // Actions
  createSession: (chartId?: string) => string; // 返回 sessionId
  addMessage: (sessionId: string, message: ChatMessage) => void;
  setCurrentSession: (id: string) => void;
}
```

---

## 5. 存储层（IndexedDB）

```typescript
// src/db/index.ts

/**
 * 数据库：XuanJiDB
 * 
 * Object Stores:
 * - charts: 命盘数据
 * - chat_sessions: 对话会话
 * - chat_messages: 对话消息
 * - knowledge_stats: 知识使用统计
 * - settings: 用户设置
 */

const DB_NAME = 'XuanJiDB';
const DB_VERSION = 1;

// 使用 idb 或 dexie 封装
```

---

## 6. AI 服务封装

```typescript
// src/services/ai.ts

interface AIResponse {
  content: string;
  citations?: Array<{
    entryId: string;
    title: string;
    quote: string;
  }>;
}

/**
 * 生成命盘解读
 * @param chart 命盘
 * @param topic 解读主题（性格/事业/感情/健康）
 * @param context 检索到的知识上下文
 */
export async function generateReading(
  chart: BaziChart,
  topic: string,
  context: RAGContext
): Promise<AIResponse>;

/**
 * 对话回复
 * @param session 当前会话
 * @param userMessage 用户消息
 * @param context 知识库上下文
 */
export async function generateReply(
  session: ChatSession,
  userMessage: string,
  context: RAGContext
): Promise<AIResponse>;

// Prompt 模板在 src/services/prompts/ 下管理
```

---

## 7. 组件规范

### 7.1 命名
- 页面组件：`*Page.tsx`（如 `HomePage.tsx`）
- 业务组件：PascalCase，语义明确（如 `BaziChartView`）
- 通用组件：`components/common/` 下，可复用

### 7.2 八字可视化组件

```typescript
// src/components/bazi/BaziChartView.tsx

interface Props {
  chart: BaziChart;
  onPillarClick?: (pillar: Pillar, position: 'year' | 'month' | 'day' | 'hour') => void;
  highlightElements?: Element[];
}

// 渲染四柱排布 + 交互高亮
```

### 7.3 知识卡片组件

```typescript
// src/components/knowledge/KnowledgeCard.tsx

interface Props {
  entry: KnowledgeEntry;
  showCitation?: boolean;
  onClick?: () => void;
}

// 显示知识标题、来源、可信度标签、摘要
```

---

## 8. 样式规范

### 8.1 Tailwind 配置

```javascript
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        'ink': '#1a1a2e',
        'cinnabar': '#c23a30',
        'paper': '#f5f0e8',
        'lapis': '#2e5090',
        // 五行色
        'element-metal': '#e8e8e8',
        'element-wood': '#4a7c59',
        'element-water': '#1e3a5f',
        'element-fire': '#c23a30',
        'element-earth': '#8b6914',
      },
      fontFamily: {
        'serif-zh': ['Noto Serif SC', 'serif'],
        'sans-zh': ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
};
```

### 8.2 CSS 变量

```css
/* index.css */

:root {
  --color-ink: #1a1a2e;
  --color-cinnabar: #c23a30;
  --color-paper: #f5f0e8;
  --color-lapis: #2e5090;
  
  /* 五行 */
  --element-wood: #4a7c59;
  --element-fire: #c23a30;
  --element-earth: #8b6914;
  --element-metal: #b8b8b8;
  --element-water: #1e3a5f;
}
```

---

## 9. 测试策略

### 9.1 单元测试（Vitest）

```typescript
// src/core/bazi/__tests__/calculator.test.ts

import { describe, it, expect } from 'vitest';
import { calculateBazi } from '../calculator';

describe('八字排盘', () => {
  it('应正确计算已知命盘', () => {
    // 测试案例：某名人命盘
    const birth = { year: 1990, month: 1, day: 15, hour: 12, minute: 0, gender: '男', timezone: 8 };
    const chart = calculateBazi(birth);
    expect(chart.dayMaster).toBe('庚');
    // ...
  });
  
  it('年柱应以立春为界', () => {
    // 立春前 vs 立春后
  });
});
```

### 9.2 测试重点
- [ ] 排盘算法准确性（与已知命盘对比）
- [ ] 知识库检索精度
- [ ] AI Prompt 组装正确性
- [ ] 数据持久化（IndexedDB）

---

## 10. 开发流程

### 10.1 里程碑

| 阶段 | 目标 | 预计时间 |
|------|------|---------|
| Sprint 1 | 项目骨架 + 排盘引擎 + 基础 UI | 1 周 |
| Sprint 2 | 知识库系统 + 检索引擎 | 1 周 |
| Sprint 3 | AI 解读 + 对话系统 | 1 周 |
| Sprint 4 | 测试 + 优化 + 部署 | 3-5 天 |

### 10.2 Git 提交规范

```
feat: 新增功能
fix: 修复问题
docs: 文档更新
refactor: 重构
test: 测试相关
ci: CI/CD 配置
```

### 10.3 代码规范
- ESLint + Prettier 配置
- 所有函数必须有 JSDoc 注释
- 核心算法必须有单元测试
- 禁止 any 类型（除非必要且注释说明）

---

## 11. 部署

### 11.1 GitHub Pages
- 静态部署
- 所有数据本地存储（IndexedDB）
- AI 调用走 Kimi API（需用户自行配置 API Key）

### 11.2 环境变量
```bash
# .env
VITE_KIMI_API_KEY=sk-xxx       # Kimi API Key
VITE_KIMI_BASE_URL=https://agent-gw.kimi.com/coding  # 可选，自定义端点
```

---

> **签名**: Kimi Claw  
> **日期**: 2026-06-16  
> **状态**: Ready for Development
