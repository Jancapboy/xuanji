import { useState } from 'react';
import { useChartStore } from '../stores/chartStore';
import { calculateTenGod, STEM_ELEMENT, BRANCH_ELEMENT } from '../core/bazi/calculator';
import type { Pillar, BaziChart } from '../types/bazi';

// 五行颜色
const ELEMENT_COLORS: Record<string, string> = {
  '木': 'text-element-wood',
  '火': 'text-element-fire',
  '土': 'text-element-earth',
  '金': 'text-element-metal',
  '水': 'text-element-water',
};

const ELEMENT_BG: Record<string, string> = {
  '木': 'bg-green-50',
  '火': 'bg-red-50',
  '土': 'bg-yellow-50',
  '金': 'bg-gray-100',
  '水': 'bg-blue-50',
};

// 传统四柱排盘组件
function TraditionalChart({ chart }: { chart: BaziChart }) {
  const pillars = [
    { label: '年柱', key: 'year' as const, pillar: chart.year },
    { label: '月柱', key: 'month' as const, pillar: chart.month },
    { label: '日柱', key: 'day' as const, pillar: chart.day },
    { label: '时柱', key: 'hour' as const, pillar: chart.hour },
  ];

  // 十神颜色
  const tenGodColor = (tg: string) => {
    const colors: Record<string, string> = {
      '比肩': 'text-element-wood', '劫财': 'text-element-wood',
      '食神': 'text-element-fire', '伤官': 'text-element-fire',
      '偏财': 'text-element-earth', '正财': 'text-element-earth',
      '七杀': 'text-element-metal', '正官': 'text-element-metal',
      '偏印': 'text-element-water', '正印': 'text-element-water',
    };
    return colors[tg] || 'text-gray-400';
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
      <div className="min-w-[320px]">
        {/* 标签行 */}
        <div className="grid grid-cols-4 gap-1 mb-2 text-center">
          {pillars.map(({ label }) => (
            <div key={label} className="text-xs text-gray-400 font-medium">{label}</div>
          ))}
        </div>

        {/* 天干十神行 */}
        <div className="grid grid-cols-4 gap-1 mb-1 text-center">
          {pillars.map(({ pillar }) => {
            const tg = calculateTenGod(chart.dayMaster, pillar.stem);
            return (
              <div key={`tg-${pillar.stem}`} className={`text-xs ${tenGodColor(tg)}`}>
                {tg}
              </div>
            );
          })}
        </div>

        {/* 天干行 */}
        <div className="grid grid-cols-4 gap-1 mb-1 text-center">
          {pillars.map(({ pillar }) => (
            <div key={`stem-${pillar.stem}`} className="py-2">
              <span className={`text-2xl font-serif-zh font-bold ${ELEMENT_COLORS[STEM_ELEMENT[pillar.stem]]}`}>
                {pillar.stem}
              </span>
            </div>
          ))}
        </div>

        {/* 地支行 */}
        <div className="grid grid-cols-4 gap-1 mb-1 text-center">
          {pillars.map(({ pillar }) => (
            <div key={`branch-${pillar.branch}`} className="py-2 border-t border-gray-100">
              <span className={`text-2xl font-serif-zh font-bold ${ELEMENT_COLORS[BRANCH_ELEMENT[pillar.branch]]}`}>
                {pillar.branch}
              </span>
            </div>
          ))}
        </div>

        {/* 地支十神行 */}
        <div className="grid grid-cols-4 gap-1 mb-2 text-center">
          {pillars.map(({ pillar }) => {
            const tg = pillar.tenGod || '';
            return (
              <div key={`btg-${pillar.branch}`} className={`text-xs ${tenGodColor(tg)}`}>
                {tg}
              </div>
            );
          })}
        </div>

        {/* 藏干 + 藏干十神 */}
        <div className="grid grid-cols-4 gap-1 text-center border-t border-gray-100 pt-2">
          {pillars.map(({ pillar }) => (
            <div key={`hidden-${pillar.stem}`} className="space-y-1">
              {pillar.hiddenStems.map((h, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className={`text-sm font-serif-zh ${ELEMENT_COLORS[STEM_ELEMENT[h.stem]]}`}>
                    {h.stem}
                  </span>
                  <span className={`text-xs ${tenGodColor(h.tenGod || '')}`}>
                    {h.tenGod}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 大运流年组件
function DaYunPanel({ chart }: { chart: BaziChart }) {
  const [selectedYun, setSelectedYun] = useState(0);
  const daYun = chart.daYun || [];
  
  if (daYun.length === 0) return null;

  const currentYun = daYun[selectedYun];
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(chart.id.split('-')[0]);
  
  // 生成流年
  const liuNian = Array.from({ length: 10 }, (_, i) => {
    const year = birthYear + currentYun.startAge + i;
    const stemIdx = (year - 4) % 10;
    const branchIdx = (year - 4) % 12;
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const stem = stems[stemIdx];
    const branch = branches[branchIdx];
    return {
      year,
      stem: stems[stemIdx] as any,
      branch: branches[branchIdx] as any,
      tenGod: calculateTenGod(chart.dayMaster, stems[stemIdx] as any),
      isCurrent: year === currentYear,
    };
  });

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h3 className="text-sm font-medium text-gray-600">大运流年</h3>
      
      {/* 大运选择 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {daYun.map((dy, i) => (
          <button
            key={i}
            onClick={() => setSelectedYun(i)}
            className={`shrink-0 px-3 py-2 rounded-lg text-sm text-center transition-colors ${
              selectedYun === i
                ? 'bg-ink text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="font-serif-zh font-bold">{dy.stem}{dy.branch}</div>
            <div className="text-xs mt-0.5 opacity-80">{dy.ageRange}</div>
          </button>
        ))}
      </div>

      {/* 当前大运详情 */}
      {currentYun && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-serif-zh font-bold">{currentYun.stem}{currentYun.branch}</span>
              <span className="text-sm text-gray-500 ml-2">{currentYun.ageRange}</span>
            </div>
            <div className="text-xs text-gray-400">
              起运年龄: {currentYun.startAge}岁
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            十神: {calculateTenGod(chart.dayMaster, currentYun.stem as any)}
          </div>
        </div>
      )}

      {/* 流年 */}
      <div>
        <div className="text-xs text-gray-400 mb-2">流年推演</div>
        <div className="grid grid-cols-5 gap-2">
          {liuNian.map((ln) => (
            <div
              key={ln.year}
              className={`text-center p-2 rounded-lg text-sm ${
                ln.isCurrent ? 'bg-cinnabar/10 text-cinnabar' : 'bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-400">{ln.year}</div>
              <div className="font-serif-zh font-bold">{ln.stem}{ln.branch}</div>
              <div className="text-xs text-gray-500">{ln.tenGod}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 命盘报告组件
function ReportGenerator({ chart }: { chart: BaziChart }) {
  const generateReport = () => {
    const lines: string[] = [];
    
    lines.push(`【八字命盘分析报告】`);
    lines.push(`日主: ${chart.dayMaster}（${STEM_ELEMENT[chart.dayMaster]}）`);
    lines.push(`格局: ${chart.patterns.join('、')}`);
    lines.push('');
    
    lines.push(`【四柱】`);
    const pillars = [chart.year, chart.month, chart.day, chart.hour];
    const labels = ['年柱', '月柱', '日柱', '时柱'];
    pillars.forEach((p, i) => {
      const hidden = p.hiddenStems.map(h => `${h.stem}(${h.tenGod})`).join('、');
      lines.push(`${labels[i]}: ${p.stem} ${p.branch} | 藏干: ${hidden}`);
    });
    lines.push('');
    
    lines.push(`【五行力量】`);
    const sortedElements = Object.entries(chart.elementProfile).sort((a, b) => b[1] - a[1]);
    sortedElements.forEach(([e, v]) => lines.push(`  ${e}: ${v.toFixed(1)}`));
    lines.push('');
    
    lines.push(`【十神分布】`);
    const sortedTG = Object.entries(chart.tenGodProfile).sort((a, b) => b[1] - a[1]);
    sortedTG.forEach(([tg, v]) => lines.push(`  ${tg}: ${v.toFixed(1)}`));
    lines.push('');
    
    if (chart.nayin) {
      lines.push(`【纳音】`);
      lines.push(`  年: ${chart.nayin.year} | 月: ${chart.nayin.month} | 日: ${chart.nayin.day} | 时: ${chart.nayin.hour}`);
      lines.push('');
    }
    
    if (chart.relations) {
      lines.push(`【天干地支关系】`);
      chart.relations.stem.forEach(r => lines.push(`  ${r}`));
      chart.relations.branch.forEach(r => lines.push(`  ${r}`));
      lines.push('');
    }
    
    if (chart.shenSha) {
      lines.push(`【神煞】`);
      Object.entries(chart.shenSha).forEach(([name, values]) => {
        if (values.length > 0) lines.push(`  ${name}: ${values.join('、')}`);
      });
      lines.push('');
    }
    
    if (chart.daYun) {
      lines.push(`【大运】`);
      chart.daYun.forEach(dy => {
        lines.push(`  ${dy.stem}${dy.branch} (${dy.ageRange})`);
      });
    }
    
    return lines.join('\n');
  };

  const [report, setReport] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setReport(generateReport());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">命盘报告</h3>
        <button
          onClick={handleGenerate}
          className="px-3 py-1.5 bg-ink text-white text-sm rounded-lg hover:bg-ink/90 transition-colors"
        >
          生成报告
        </button>
      </div>
      
      {report && (
        <div className="relative">
          <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {report}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2 py-1 bg-white/80 text-xs text-gray-600 rounded border border-gray-200 hover:bg-white transition-colors"
          >
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChartPage() {
  const chart = useChartStore((s) => s.getCurrentChart());
  const charts = useChartStore((s) => s.charts);
  const setCurrentChart = useChartStore((s) => s.setCurrentChart);

  if (!chart) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>暂无命盘</p>
        <p className="text-sm mt-2">请先排盘</p>
      </div>
    );
  }

  const elements = chart.elementProfile;
  const maxElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0];
  const nayin = chart.nayin;
  const twelveStage = chart.twelveStage;
  const relations = chart.relations;
  const shenSha = chart.shenSha;
  const daYun = chart.daYun;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* 命盘选择器 */}
      {charts.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {charts.map((c) => (
            <button
              key={c.id}
              onClick={() => setCurrentChart(c.id)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                c.id === chart.id
                  ? 'bg-ink text-white'
                  : 'bg-white text-gray-600'
              }`}
            >
              {c.year.stem}{c.year.branch}年
            </button>
          ))}
        </div>
      )}

      {/* 日主信息 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-center">
          <span className="text-3xl font-serif-zh text-cinnabar">{chart.dayMaster}</span>
          <span className="text-gray-500 ml-2">日主</span>
        </div>
        <div className="text-center text-sm text-gray-500 mt-1">
          五行属{STEM_ELEMENT[chart.dayMaster]} · {chart.patterns.join(' · ')}
        </div>
      </div>

      {/* 传统排盘 */}
      <TraditionalChart chart={chart} />

      {/* 纳音五行 */}
      {nayin && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-3">纳音五行</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {Object.entries(nayin).map(([key, val]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-400">{key === 'year' ? '年' : key === 'month' ? '月' : key === 'day' ? '日' : '时'}</div>
                <div className="font-medium">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 十二长生 */}
      {twelveStage && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-3">十二长生</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {Object.entries(twelveStage).map(([key, val]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-400">{key === 'year' ? '年' : key === 'month' ? '月' : key === 'day' ? '日' : '时'}</div>
                <div className="font-medium">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 合冲刑害 */}
      {relations && (relations.branch.length > 0 || relations.stem.length > 0) && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-3">天干地支关系</h3>
          <div className="flex flex-wrap gap-2">
            {relations.stem.map((r, i) => (
              <span key={`s-${i}`} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm">{r}</span>
            ))}
            {relations.branch.map((r, i) => (
              <span key={`b-${i}`} className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-sm">{r}</span>
            ))}
          </div>
        </div>
      )}

      {/* 神煞 */}
      {shenSha && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-3">神煞</h3>
          <div className="space-y-2">
            {Object.entries(shenSha).map(([name, values]) => (
              values.length > 0 && (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-16 shrink-0">{name}</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded">{values.join('、')}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* 大运流年 */}
      <DaYunPanel chart={chart} />

      {/* 五行力量 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-600 mb-3">五行力量</h3>
        <div className="space-y-2">
          {Object.entries(elements).map(([element, value]) => {
            const max = Math.max(...Object.values(elements));
            const pct = max > 0 ? (value / max) * 100 : 0;
            const colors: Record<string, string> = {
              '木': 'bg-element-wood',
              '火': 'bg-element-fire',
              '土': 'bg-element-earth',
              '金': 'bg-element-metal',
              '水': 'bg-element-water',
            };
            return (
              <div key={element} className="flex items-center gap-2">
                <span className="w-6 text-sm">{element}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors[element]} rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">{value.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 十神 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-600 mb-3">十神分布</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-sm">
          {Object.entries(chart.tenGodProfile)
            .sort((a, b) => b[1] - a[1])
            .map(([tg, val]) => (
              <div key={tg} className="bg-gray-50 rounded-lg p-2">
                <div>{tg}</div>
                <div className="text-xs text-gray-400">{val.toFixed(1)}</div>
              </div>
            ))}
        </div>
      </div>

      {/* 命盘报告 */}
      <ReportGenerator chart={chart} />
    </div>
  );
}
