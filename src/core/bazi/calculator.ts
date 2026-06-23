import type { Stem, Branch, Pillar, BaziChart, BirthInfo, Element, TenGod } from '../../types/bazi';
import { SOLAR_TERM_DATA } from './solarTerms';

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

// ========== 节气工具函数 ==========

/**
 * 获取某年的节气数据
 */
function getSolarTerms(year: number) {
  return SOLAR_TERM_DATA[year] || SOLAR_TERM_DATA[2000]; // fallback
}

/**
 * 判断日期是否在指定节气之后（含当天）
 */
function isAfterSolarTerm(year: number, month: number, day: number, termName: string): boolean {
  const terms = getSolarTerms(year);
  const term = terms.find(t => t.name === termName);
  if (!term) return false;
  
  // 处理跨年节气（如小寒在1月，数据存储在上一年）
  let termYear = year;
  let termMonth = term.month;
  let termDay = term.day;
  
  // 如果节气在1月且当前月份在下半年，可能是下一年的数据
  // 但我们的数据表已处理：小寒/大雪等跨年的节直接存储在上一年
  
  if (month > termMonth || (month === termMonth && day >= termDay)) {
    return true;
  }
  return false;
}

/**
 * 获取日期对应的月柱地支索引
 * 以节气为界：立春=寅月，惊蛰=卯月，...，小寒=丑月
 */
function getMonthBranchIndex(year: number, month: number, day: number): number {
  const jieNames = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
  const branchNames: Branch[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  
  // 从立春开始依次判断
  for (let i = 0; i < 12; i++) {
    if (isAfterSolarTerm(year, month, day, jieNames[i])) {
      // 继续检查下一个节气，确定区间
      const nextIdx = (i + 1) % 12;
      const nextYear = nextIdx === 0 ? year + 1 : year; // 立春跨年
      const nextTerm = getSolarTerms(nextYear === year ? year : year).find(t => t.name === jieNames[nextIdx]);
      
      // 如果在当前节气之后，且不在下一个节气之后，则归属当前节气
      if (nextTerm) {
        let nextMonth = nextTerm.month;
        let nextDay = nextTerm.day;
        // 处理跨年的小寒
        if (jieNames[nextIdx] === '小寒' && nextMonth === 1) {
          nextYear; // already handled
        }
        
        if (month < nextMonth || (month === nextMonth && day < nextDay)) {
          return BRANCHES.indexOf(branchNames[i]);
        }
        // 否则继续循环
      }
    }
  }
  
  // 默认返回丑月（如果还没到立春，属于上一年丑月）
  // 但这种情况需要跨年处理
  return 11; // 丑
}

// 更简洁的方法：直接找到当前日期所在的节气区间
function getMonthBranchIndexV2(year: number, month: number, day: number): { index: number; adjustedYear: number } {
  const jieNames = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
  const branchNames: Branch[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  
  // 先判断立春，确定是否跨到上一年
  let adjustedYear = year;
  const liChun = getSolarTerms(year).find(t => t.name === '立春');
  if (liChun) {
    if (month < liChun.month || (month === liChun.month && day < liChun.day)) {
      // 立春前，属于上一年
      adjustedYear = year - 1;
    }
  }
  
  const terms = getSolarTerms(adjustedYear);
  
  // 从最后一个节气往前找
  for (let i = 11; i >= 0; i--) {
    const term = terms.find(t => t.name === jieNames[i]);
    if (term) {
      if (month > term.month || (month === term.month && day >= term.day)) {
        return { index: BRANCHES.indexOf(branchNames[i]), adjustedYear };
      }
    }
  }
  
  // 如果还没到当年第一个节气，回到上一年最后一个
  return { index: 11, adjustedYear: adjustedYear - 1 }; // 丑月
}

// ========== 核心排盘算法（修正版） ==========

/**
 * 计算年柱（以立春为界）
 */
function calculateYearPillar(year: number, month: number, day: number): { pillar: Pillar; adjustedYear: number } {
  const { adjustedYear } = getMonthBranchIndexV2(year, month, day);
  
  const stem = STEMS[(adjustedYear - 4) % 10];
  const branch = BRANCHES[(adjustedYear - 4) % 12];
  
  return {
    pillar: {
      stem,
      branch,
      hiddenStems: BRANCH_HIDDEN_STEMS[branch].map(hs => ({
        ...hs,
      })),
    },
    adjustedYear,
  };
}

/**
 * 计算月柱（以节气为界）
 */
function calculateMonthPillar(year: number, month: number, day: number, yearStem: Stem): Pillar {
  const { index: branchIndex, adjustedYear } = getMonthBranchIndexV2(year, month, day);
  const branch = BRANCHES[branchIndex];
  
  // 月干按年干查五虎遁，但需要用调整后的年干（如果跨年了）
  const adjustedYearStem = STEMS[(adjustedYear - 4) % 10];
  const stem = YEAR_MONTH_STEM[adjustedYearStem][branchIndex];
  
  return {
    stem,
    branch,
    hiddenStems: BRANCH_HIDDEN_STEMS[branch].map(hs => ({
      ...hs,
    })),
  };
}

/**
 * 计算日柱（使用简化公式，1900-2100年范围内准确）
 */
function calculateDayPillar(year: number, month: number, day: number): Pillar {
  // 基准：1900年1月31日为甲辰日
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const stemIndex = (diffDays + 0) % 10;
  const branchIndex = (diffDays + 4) % 12;
  
  const stem = STEMS[stemIndex < 0 ? stemIndex + 10 : stemIndex];
  const branch = BRANCHES[branchIndex < 0 ? branchIndex + 12 : branchIndex];
  
  return {
    stem,
    branch,
    hiddenStems: BRANCH_HIDDEN_STEMS[branch].map(hs => ({
      ...hs,
    })),
  };
}

/**
 * 计算时柱（含子时跨日处理）
 * 
 * 子时划分：
 * - 23:00-00:00（夜子时）：日柱不变，时柱按当日日干推算
 * - 00:00-01:00（早子时）：日柱变为次日，时柱按次日日干推算
 */
function calculateHourPillar(year: number, month: number, day: number, hour: number, minute: number, dayStem: Stem): Pillar {
  let effectiveDayStem = dayStem;
  let effectiveDay = day;
  
  // 子时跨日处理
  if (hour === 23) {
    // 23:00-00:00 属于当日，日柱不变
    // 时柱按当日日干推算
  } else if (hour === 0 || hour === 1) {
    // 00:00-01:00 属于次日
    // 日柱应变为次日
    const nextDate = new Date(year, month - 1, day + 1);
    const nextDayPillar = calculateDayPillar(nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate());
    effectiveDayStem = nextDayPillar.stem;
    effectiveDay = nextDate.getDate();
  }
  
  // 时支：23:00-01:00 均为子时
  const branchIndex = hour === 23 ? 0 : (hour === 0 || hour === 1) ? 0 : Math.floor((hour + 1) / 2) % 12;
  const branch = BRANCHES[branchIndex];
  const stem = DAY_HOUR_STEM[effectiveDayStem][branch];
  
  return {
    stem,
    branch,
    hiddenStems: BRANCH_HIDDEN_STEMS[branch].map(hs => ({
      ...hs,
    })),
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
  
  // 月令格局（看月支藏干主气）
  const monthHiddenMain = month.hiddenStems[0].stem;
  const monthTenGod = calculateTenGod(dayMaster, monthHiddenMain);
  
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
 * 八字排盘主函数（修正版）
 * 
 * 修正内容：
 * 1. 年柱以立春为界（非农历年初一）
 * 2. 月柱以节气为界（非农历月份）
 * 3. 子时跨日处理（23:00-00:00当日，00:00-01:00次日）
 * 4. 地支和藏干标注十神
 */
export function calculateBazi(birth: BirthInfo): BaziChart {
  const { year, month, day, hour, minute } = birth;
  
  // 计算日柱（先算日柱，因为时柱需要日干）
  const dayPillar = calculateDayPillar(year, month, day);
  
  // 计算时柱（含子时跨日处理）
  const hourPillar = calculateHourPillar(year, month, day, hour, minute, dayPillar.stem);
  
  // 计算年柱（以立春为界）
  const { pillar: yearPillar, adjustedYear } = calculateYearPillar(year, month, day);
  
  // 计算月柱（以节气为界）
  const monthPillar = calculateMonthPillar(year, month, day, yearPillar.stem);
  
  // 标注十神
  const dayMaster = dayPillar.stem;
  
  const annotatePillar = (pillar: Pillar): Pillar => {
    return {
      ...pillar,
      tenGod: calculateTenGod(dayMaster, pillar.stem),
      hiddenStems: pillar.hiddenStems.map(hs => ({
        ...hs,
        tenGod: calculateTenGod(dayMaster, hs.stem),
      })),
    };
  };
  
  const chart: BaziChart = {
    id: `${year}-${month}-${day}-${hour}-${minute}`,
    year: annotatePillar(yearPillar),
    month: annotatePillar(monthPillar),
    day: annotatePillar(dayPillar),
    hour: annotatePillar(hourPillar),
    dayMaster,
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
