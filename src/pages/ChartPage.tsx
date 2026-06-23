import { useChartStore } from '../stores/chartStore';
import { calculateTenGod, STEM_ELEMENT, BRANCH_ELEMENT } from '../core/bazi/calculator';
import type { Pillar } from '../types/bazi';

function PillarCard({ label, pillar, dayMaster }: { label: string; pillar: Pillar; dayMaster: string }) {
  const stemColor = {
    '木': 'text-element-wood',
    '火': 'text-element-fire',
    '土': 'text-element-earth',
    '金': 'text-element-metal',
    '水': 'text-element-water',
  }[STEM_ELEMENT[pillar.stem]];

  const branchColor = {
    '木': 'text-element-wood',
    '火': 'text-element-fire',
    '土': 'text-element-earth',
    '金': 'text-element-metal',
    '水': 'text-element-water',
  }[BRANCH_ELEMENT[pillar.branch]];

  const stemTenGod = calculateTenGod(dayMaster as any, pillar.stem);
  const branchTenGod = pillar.tenGod || calculateTenGod(dayMaster as any, pillar.branch as any);

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm text-center">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      {/* 天干 + 十神 */}
      <div className="text-2xl font-serif-zh leading-tight">
        <span className={stemColor}>{pillar.stem}</span>
        <span className="text-xs text-gray-400 ml-1">{stemTenGod}</span>
      </div>
      {/* 地支 + 十神 */}
      <div className="text-xl font-serif-zh leading-tight mt-1">
        <span className={branchColor}>{pillar.branch}</span>
        <span className="text-xs text-gray-400 ml-1">{branchTenGod}</span>
      </div>
      {/* 藏干 + 十神 */}
      <div className="text-xs text-gray-500 mt-2 space-y-0.5">
        {pillar.hiddenStems.map((h, i) => (
          <div key={i} className="flex justify-center gap-1">
            <span>{h.stem}</span>
            <span className="text-gray-400">{h.tenGod}</span>
          </div>
        ))}
      </div>
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

      {/* 四柱 */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <PillarCard label="年柱" pillar={chart.year} dayMaster={chart.dayMaster} />
        <PillarCard label="月柱" pillar={chart.month} dayMaster={chart.dayMaster} />
        <PillarCard label="日柱" pillar={chart.day} dayMaster={chart.dayMaster} />
        <PillarCard label="时柱" pillar={chart.hour} dayMaster={chart.dayMaster} />
      </div>

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

      {/* 大运 */}
      {daYun && daYun.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600 mb-3">大运</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {daYun.slice(0, 4).map((dy, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-400">{dy.ageRange}</div>
                <div className="font-medium">{dy.stem}{dy.branch}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-sm mt-2">
            {daYun.slice(4, 8).map((dy, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-400">{dy.ageRange}</div>
                <div className="font-medium">{dy.stem}{dy.branch}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
