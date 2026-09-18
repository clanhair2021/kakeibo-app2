'use client';

import { useMemo } from 'react';

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

export default function Analytics({ expenses = [] }: { expenses: Expense[] }) {
  // 今月の合計金額
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  // カテゴリ別集計データ
  const categoryData = useMemo(() => {
    const map: { [key: string]: number } = {};
    expenses.forEach((item) => {
      const cat = item.category || 'その他';
      map[cat] = (map[cat] || 0) + (Number(item.amount) || 0);
    });
    return Object.keys(map).map((key) => ({
      name: key,
      value: map[key],
    }));
  }, [expenses]);

  // SVGドーナツグラフのパス計算
  const slices = useMemo(() => {
    if (totalAmount === 0) return [];
    let cumulativePercent = 0;

    return categoryData.map((item, index) => {
      const percent = item.value / totalAmount;
      const startAngle = cumulativePercent * 360;
      cumulativePercent += percent;
      const endAngle = cumulativePercent * 360;

      const x1 = Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = Math.sin((Math.PI * (endAngle - 90)) / 180);

      const largeArcFlag = percent > 0.5 ? 1 : 0;
      const pathData = percent === 1
        ? `M 0 -1 A 1 1 0 1 1 -0.0001 -1 L 0 0 Z`
        : `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        ...item,
        pathData,
        color: COLORS[index % COLORS.length],
        percentage: Math.round(percent * 100),
      };
    });
  }, [categoryData, totalAmount]);

  return (
    <div className="space-y-6">
      {/* 今月の合計支出 */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md text-center">
        <p className="text-sm text-slate-400">総支出額</p>
        <p className="text-3xl font-bold text-emerald-400 mt-1">
          ¥{totalAmount.toLocaleString()}
        </p>
      </div>

      {/* カテゴリ別内訳 */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-slate-100 mb-6 text-center">カテゴリ別内訳</h3>

        {categoryData.length > 0 && totalAmount > 0 ? (
          <div className="flex flex-col items-center gap-6">
            {/* SVGドーナツグラフ */}
            <div className="relative w-48 h-48">
              <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
                {slices.map((slice, i) => (
                  <path key={i} d={slice.pathData} fill={slice.color} />
                ))}
                {/* 真ん中の穴 */}
                <circle cx="0" cy="0" r="0.65" fill="#1e293b" />
              </svg>
            </div>

            {/* 凡例・内訳リスト */}
            <div className="w-full space-y-2">
              {slices.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-200">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-100">¥{item.value.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-8">データがありません</p>
        )}
      </div>
    </div>
  );
}
