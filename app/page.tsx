'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Analytics from './components/Analytics';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: string;
  payer: string;
  payment_method: string;
  date: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'register' | 'search'>('home');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // データ取得
  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 pb-20 p-4 max-w-md mx-auto">
      {/* ヘッダー */}
      <header className="flex justify-between items-center mb-6 pt-2">
        <h1 className="text-xl font-bold flex items-center gap-2">
          🏠 共有家計簿 & 経費
        </h1>
        <button
          onClick={fetchExpenses}
          className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700"
        >
          更新
        </button>
      </header>

      {/* タブ切り替えコンテンツ */}
      {activeTab === 'home' && (
        <section className="space-y-3">
          <h2 className="text-md font-bold text-slate-300 mb-2">📋 登録履歴</h2>
          {loading ? (
            <p className="text-center text-slate-500 py-8">読み込み中...</p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-slate-500 py-8">データがありません</p>
          ) : (
            expenses.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.category} • {item.payer} • {item.payment_method}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400 text-lg">
                    ¥{Number(item.amount).toLocaleString()}
                  </p>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                    {item.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'analytics' && (
        <section>
          <h2 className="text-md font-bold text-slate-300 mb-4">📊 支出分析・グラフ</h2>
          <Analytics expenses={expenses} />
        </section>
      )}

      {/* 下部ナビゲーションバー */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-2 max-w-md mx-auto flex justify-around text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 ${
            activeTab === 'home' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          🏠 <span>ホーム</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center py-1 ${
            activeTab === 'analytics' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          📊 <span>分析</span>
        </button>
      </nav>
    </main>
  );
}

