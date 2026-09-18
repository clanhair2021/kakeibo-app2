'use client';

import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

export default function Analytics({ expenses }: { expenses: Expense[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 今月の合計金額
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [expenses]);

  // カテゴリ別集計データ
  const categoryData = useMemo(() => {
    const map: { [key: string]: number } = {};
    expenses.forEach((item) => {
      const cat = item.category || 'その他';
      map[cat] = (map[cat] || 0) + Number(item.amount);
    });
    return Object.keys(map).map((key) => ({
      name: key,
      value: map[key],
    }));
  }, [expenses]);

  if (!isMounted) {
    return <p className="text-center text-slate-500 py-12">読み込み中...</p>;
  }

  return (
    <div className="space-y-6">
      {/* 今月の合計支出 */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md text-center">
        <p className="text-sm text-slate-400">総支出額</p>
        <p className="text-3xl font-bold text-emerald-400 mt-1">
          ¥{totalAmount.toLocaleString()}
        </p>
      </div>

      {/* カテゴリ別割合グラフ */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-100 mb-4 text-center">カテゴリ別内訳</h3>
        
        {categoryData.length > 0 ? (
          <PieChart width={300} height={260}>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        ) : (
          <p className="text-center text-slate-400 py-8">データがありません</p>
        )}
      </div>
    </div>
  );
}

