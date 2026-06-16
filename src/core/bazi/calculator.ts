import type { Stem, Branch, Pillar, BaziChart, BirthInfo, Element, TenGod } from '../types/bazi';

// ========== 基础数据表 ==========

const STEMS: Stem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
const STEM_ELEMENT: Record<Stem, Element> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 天干阴阳
const STEM_POLARITY: Record<Stem, string> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
};

// 地支五行
const BRANCH_ELEMENT: Record<Branch, Element> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土',
  '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

// 地支藏干
const BRANCH_HIDDEN_STEMS: Record<Branch, Array<{ stem: Stem; percentage: number }>> = {
  '子': [{ stem: '癸', percentage: 1 }],
  '丑': [{ stem: '己', percentage: 0.6 }, { stem: '癸', percentage: 0.3 }, { stem: '辛', percentage: 0.1 }],
  '寅': [{ stem: '甲', percentage: 0.6 }, { stem: '丙', percentage: 0.3 }, { stem: '戊', percentage: 0.1 }],
  '卯': [{ stem: '乙', percentage: 1 }],
  '辰': [{ stem: '戊', percentage: 0.6 }, { stem: '乙', percentage: 0.3 }, { stem: '癸', percentage: 0.1 }],
  '巳': [{ stem: '丙', percentage: 0.6 }, { stem: '庚', percentage: 0.3 }, { stem: '戊', percentage: 0.1 }],
  '午': [{ stem: '丁', percentage: 0.7 }, { stem: '己', percentage: 0.3 }],
  '未': [{ stem: '己', percentage: 0.6 }, { stem: '丁', percentage: 0.3 }, { stem: '乙', percentage: 0.1 }],
  '申': [{ stem: '庚', percentage: 0.6 }, { stem: '壬', percentage: 0.3 }, { stem: '戊', percentage: 0.1 }],
  '酉': [{ stem: '辛', percentage: 1 }],
  '戌': [{ stem: '戊', percentage: 0.6 }, { stem: '辛', percentage: 0.3 }, { stem: '丁', percentage: 0.1 }],
  '亥': [{ stem: '壬', percentage: 0.7 }, { stem: '甲', percentage: 0.3 }],
};

// 年上起月表（五虎遁）
const YEAR_MONTH_STEM: Record<Stem, Stem[]> = {
  '甲': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '乙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '丙': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '丁': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '戊': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '己': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '庚': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '辛': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '壬': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '癸': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
};

// 日上起时表（五鼠遁）
const DAY_HOUR_STEM: Record<Stem, Record<Branch, Stem>> = {
  '甲': { '子': '甲', '丑': '乙', '寅': '丙', '卯': '丁', '辰': '戊', '巳': '己', '午': '庚', '未': '辛', '申': '壬', '酉': '癸', '戌': '甲', '亥': '乙' },
  '乙': { '子': '丙', '丑': '丁', '寅': '戊', '卯': '己', '辰': '庚', '巳': '辛', '午': '壬', '未': '癸', '申': '甲', '酉': '乙', '戌': '丙', '亥': '丁' },
  '丙': { '子': '戊', '丑': '己', '寅': '庚', '卯': '辛', '辰': '壬', '巳': '癸', '午': '甲', '未': '乙', '申': '丙', '酉': '丁', '戌': '戊', '亥': '己' },
  '丁': { '子': '庚', '丑': '辛', '寅': '壬', '卯': '癸', '辰': '甲', '巳': '乙', '午': '丙', '未': '丁', '申': '戊', '酉': '己', '戌': '庚', '亥': '辛' },
  '戊': { '子': '壬', '丑': '癸', '寅': '甲', '卯': '乙', '辰': '丙', '巳': '丁', '午': '戊', '未': '己', '申': '庚', '酉': '辛', '戌': '壬', '亥': '癸' },
  '己': { '子': '甲', '丑': '乙', '寅': '丙', '卯': '丁', '辰': '戊', '巳': '己', '午': '庚', '未': '辛', '申': '壬', '酉': '癸', '戌': '甲', '亥': '乙' },
  '庚': { '子': '丙', '丑': '丁', '寅': '戊', '卯': '己', '辰': '庚', '巳': '辛', '午': '壬', '未': '癸', '申': '甲', '酉': '乙', '戌': '丙', '亥': '丁' },
  '辛': { '子': '戊', '丑': '己', '寅': '庚', '卯': '辛', '辰': '壬', '巳': '癸', '午': '甲', '未': '乙', '申': '丙', '酉': '丁', '戌': '戊', '亥': '己' },
  '壬': { '子': '庚', '丑': '辛', '寅': '壬', '卯': '癸', '辰': '甲', '巳': '乙', '午': '丙', '未': '丁', '申': '戊', '酉': '己', '戌': '庚', '亥': '辛' },
  '癸': { '子': '壬', '丑': '癸', '寅': '甲', '卯': '乙', '辰': '丙', '巳': '丁', '午': '戊', '未': '己', '申': '庚', '酉': '辛', '戌': '壬', '亥': '癸' },
};

// 十神计算（相对于日主）
export function calculateTenGod(dayMaster: Stem, targetStem: Stem): TenGod {
  const de = STEM_ELEMENT[dayMaster];
  const te = STEM_ELEMENT[targetStem];
  const dp = STEM_POLARITY[dayMaster];
  const tp = STEM_POLARITY[targetStem];

  // 同我
  if (de === te) {
    return dp === tp ? '比肩' : '劫财';
  }
  // 我生
  if (
    (de === '木' && te === '火') ||
    (de === '火' && te === '土') ||
    (de === '土' && te === '金') ||
    (de === '金' && te === '水') ||
    (de === '水' && te === '木')
  ) {
    return dp === tp ? '食神' : '伤官';
  }
  // 我克
  if (
    (de === '木' && te === '土') ||
    (de === '火' && te === '金') ||
    (de === '土' && te === '水') ||
    (de === '金' && te === '木') ||
    (de === '水' && te === '火')
  ) {
    return dp === tp ? '偏财' : '正财';
  }
  // 克我
  if (
    (te === '木' && de === '土') ||
    (te === '火' && de === '金') ||
    (te === '土' && de === '水') ||
    (te === '金' && de === '木') ||
    (te === '水' && de === '火')
  ) {
    return dp === tp ? '七杀' : '正官';
  }
  // 生我
  return dp === tp ? '偏印' : '正印';
}

// ========== 核心排盘算法 ==========

/**
 * 计算年柱
 * 注意：以立春为界，不是农历正月初一
 * MVP 简化：暂以农历年计算，后续可加入节气校正
 */
function calculateYearPillar(year: number): Pillar {
  const stem = STEMS[(year - 4) % 10];
  const branch = BRANCHES[(year - 4) % 12];
  return {
    stem,
    branch,
    hiddenStems: BRANCH_HIDDEN_STEMS[branch],
  };
}

/**
 * 计算月柱
 * 月支按节气划分，月干按年干查五虎遁
 */
function calculateMonthPillar(year: number, month: number, yearStem: Stem): Pillar {
  // 简化：直接使用月份对应地支（寅月为正月）
  const branch = BRANCHES[(month + 1) % 12]; // 寅=1月
  const stem = YEAR_MONTH_STEM[yearStem][month - 1];
  return {
    stem,
    branch,
    hiddenStems: BRANCH_HIDDEN_STEMS[branch],
  };
}

/**
 * 计算日柱
 * 使用简化公式（1900-2100年范围内准确）
 */
function calculateDayPillar(year: number, month: number, day: number): Pillar {
  // 简化版：使用已知基准日推算
  // 基准：1900年1月31日为甲辰日
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const stemIndex = (diffDays + 0) % 10; // 甲=0
  const branchIndex = (diffDays + 4) % 12; // 辰=4
  
  const stem = STEMS[stemIndex < 0 ? stemIndex + 10 : stemIndex];
  const branch = BRANCHES[branchIndex < 0 ? branchIndex + 12 : branchIndex];
  
  return {
    stem,
    branch,
    hiddenStems: BRANCH_HIDDEN_STEMS[branch],
  };
}

/**
 * 计算时柱
 * 时支固定（2小时一支），时干按日干查五鼠遁
 */
function calculateHourPillar(hour: number, dayStem: Stem): Pillar {
  const branchIndex = Math.floor((hour + 1) / 2) % 12;
  const branch = BRANCHES[branchIndex];
  const stem = DAY_HOUR_STEM[dayStem][branch];
  return {
    stem,
    branch,
    hiddenStems: BRANCH_HIDDEN_STEMS[branch],
  };
}

/**
 * 计算五行力量分布
 */
function calculateElementStrength(chart: BaziChart): Record<Element, number> {
  const elements: Record<Element, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const pillars = [chart.year, chart.month, chart.day, chart.hour];
  
  for (const p of pillars) {
    // 天干本气
    elements[STEM_ELEMENT[p.stem]] += 1;
    // 地支本气
    elements[BRANCH_ELEMENT[p.branch]] += 0.8;
    // 藏干
    for (const hs of p.hiddenStems) {
      elements[STEM_ELEMENT[hs.stem]] += hs.percentage * 0.5;
    }
  }
  
  return elements;
}

/**
 * 计算十神力量
 */
function calculateTenGodProfile(chart: BaziChart): Record<TenGod, number> {
  const profile: Record<string, number> = {};
  const pillars = [chart.year, chart.month, chart.day, chart.hour];
  
  for (const p of pillars) {
    const tg = calculateTenGod(chart.dayMaster, p.stem);
    profile[tg] = (profile[tg] || 0) + 1;
    for (const hs of p.hiddenStems) {
      const hstg = calculateTenGod(chart.dayMaster, hs.stem);
      profile[hstg] = (profile[hstg] || 0) + hs.percentage * 0.5;
    }
  }
  
  return profile as Record<TenGod, number>;
}

/**
 * 识别格局
 */
function identifyPatterns(chart: BaziChart): string[] {
  const patterns: string[] = [];
  const { dayMaster, month, tenGodProfile } = chart;
  
  // 月令格局
  const monthTenGod = calculateTenGod(dayMaster, month.stem);
  if (monthTenGod === '正官') patterns.push('正官格');
  else if (monthTenGod === '七杀') patterns.push('七杀格');
  else if (monthTenGod === '正印') patterns.push('正印格');
  else if (monthTenGod === '偏印') patterns.push('偏印格');
  else if (monthTenGod === '食神') patterns.push('食神格');
  else if (monthTenGod === '伤官') patterns.push('伤官格');
  else if (monthTenGod === '正财') patterns.push('正财格');
  else if (monthTenGod === '偏财') patterns.push('偏财格');
  
  // 从旺/从弱（简化判断）
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  const elementStrength = chart.elementProfile[dayMasterElement];
  const totalStrength = Object.values(chart.elementProfile).reduce((a, b) => a + b, 0);
  if (elementStrength / totalStrength > 0.4) {
    patterns.push('身强');
  } else if (elementStrength / totalStrength < 0.2) {
    patterns.push('身弱');
  }
  
  return patterns;
}

// ========== 主入口 ==========

/**
 * 八字排盘主函数
 */
export function calculateBazi(birth: BirthInfo): BaziChart {
  const yearPillar = calculateYearPillar(birth.year);
  const monthPillar = calculateMonthPillar(birth.year, birth.month, yearPillar.stem);
  const dayPillar = calculateDayPillar(birth.year, birth.month, birth.day);
  const hourPillar = calculateHourPillar(birth.hour, dayPillar.stem);
  
  const chart: BaziChart = {
    id: `${birth.year}-${birth.month}-${birth.day}-${birth.hour}`,
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster: dayPillar.stem,
    elementProfile: { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 },
    tenGodProfile: {} as Record<TenGod, number>,
    patterns: [],
  };
  
  chart.elementProfile = calculateElementStrength(chart);
  chart.tenGodProfile = calculateTenGodProfile(chart);
  chart.patterns = identifyPatterns(chart);
  
  return chart;
}

export { STEMS, BRANCHES, STEM_ELEMENT, BRANCH_ELEMENT, BRANCH_HIDDEN_STEMS };
