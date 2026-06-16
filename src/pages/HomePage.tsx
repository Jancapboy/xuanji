import { useState } from 'react';
import { calculateBazi } from '../core/bazi/calculator';
import { useChartStore } from '../stores/chartStore';
import type { BirthInfo } from '../types/bazi';

export default function HomePage() {
  const addChart = useChartStore((s) => s.addChart);
  const [form, setForm] = useState({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    gender: '男' as '男' | '女',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const birth: BirthInfo = {
      ...form,
      timezone: 8,
    };

    try {
      const chart = calculateBazi(birth);
      addChart(chart);
      // 导航到命盘页（通过App路由）
      window.dispatchEvent(new CustomEvent('navigate-to-chart', { detail: chart.id }));
    } catch (err) {
      alert('排盘失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif-zh text-center text-ink mb-2">玄机</h1>
      <p className="text-center text-gray-500 mb-8">AI 命理分析系统</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">年</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min="1900"
              max="2100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">月</label>
            <input
              type="number"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="12"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">日</label>
            <input
              type="number"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="31"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">时</label>
            <input
              type="number"
              value={form.hour}
              onChange={(e) => setForm({ ...form, hour: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
              max="23"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">性别</label>
          <div className="flex gap-4">
            {(['男', '女'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm({ ...form, gender: g })}
                className={`flex-1 py-2 rounded-lg border ${
                  form.gender === g
                    ? 'bg-cinnabar text-white border-cinnabar'
                    : 'bg-white text-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-ink text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? '排盘中...' : '开始排盘'}
        </button>
      </form>
    </div>
  );
}
