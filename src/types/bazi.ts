// 天干
export type Stem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 地支
export type Branch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

// 五行
export type Element = '木' | '火' | '土' | '金' | '水';

// 阴阳
export type Polarity = '阳' | '阴';

// 十神
export type TenGod = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印';

// 一柱
export interface Pillar {
  stem: Stem;
  branch: Branch;
  hiddenStems: Array<{ stem: Stem; percentage: number; tenGod?: TenGod }>;
  tenGod?: TenGod; // 地支十神（相对于日主）
}

// 四柱命盘
export interface BaziChart {
  id: string;
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMaster: Stem;
  elementProfile: Record<Element, number>;
  tenGodProfile: Record<TenGod, number>;
  patterns: string[];
}

// 出生信息
export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: '男' | '女';
  timezone: number;
  location?: string;
}
