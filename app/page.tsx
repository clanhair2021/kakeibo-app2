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
  const [activeTab, setActiveTab] = useState<'home' | 'register' | 'analytics' | 'search'>('home');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // フォームの状態
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('生活費');
  const [type, setType] = useState('変動費');
  const [payer, setPayer] = useState('Keisuke');
  const [paymentMethod, setPaymentMethod] = useState('カード');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 検索の状態
  const [searchQuery, setSearchQuery] = useState('');

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

  // 登録処理
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('expenses').insert([
      {
        title,
        amount: Number(amount),
        category,
        type,
        payer,
        payment_method: paymentMethod,
        date: new Date().toISOString(),
      },
    ]);

    if (!error) {
      setTitle('');
      setAmount('');
      fetchExpenses();
      setActiveTab('home');
    } else {
      alert('登録に失敗しました: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // 検索フィルタリング
  const filteredExpenses = expenses.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.payer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 pb-24 p-4 max-w-md mx-auto">
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

      {/* ホーム（履歴一覧） */}
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

      {/* 登録画面 */}
      {activeTab === 'register' && (
        <section className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <h2 className="text-md font-bold text-slate-100 mb-4">📝 新規登録</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">内容 / 店舗名</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: スーパー"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">金額 (円)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="例: 1500"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">カテゴリ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
                >
                  <option value="生活費">生活費</option>
                  <option value="食費">食費</option>
                  <option value="日用品">日用品</option>
                  <option value="固定費">固定費</option>
                  <option value="娯楽">娯楽</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">区分</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
                >
                  <option value="変動費">変動費</option>
                  <option value="固定費">固定費</option>
                  <option value="経費">経費</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">支払者</label>
                <input
                  type="text"
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">決済方法</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
                >
                  <option value="カード">カード</option>
                  <option value="現金">現金</option>
                  <option value="PayPay">PayPay</option>
                  <option value="口座振替">口座振替</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg mt-2 disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : '登録する'}
            </button>
          </form>
        </section>
      )}

      {/* 分析画面 */}
      {activeTab === 'analytics' && (
        <section>
          <h2 className="text-md font-bold text-slate-300 mb-4">📊 支出分析・グラフ</h2>
          <Analytics expenses={expenses} />
        </section>
      )}

      {/* 検索画面 */}
      {activeTab === 'search' && (
        <section className="space-y-4">
          <h2 className="text-md font-bold text-slate-300">🔍 履歴検索</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワードで検索 (例: スーパー, 食費)..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />

          <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
              <p className="text-center text-slate-500 py-8">一致するデータがありません</p>
            ) : (
              filteredExpenses.map((item) => (
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
          </div>
        </section>
      )}

      {/* 下部ナビゲーションバー（4つのタブ） */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-2 max-w-md mx-auto flex justify-around text-xs z-50">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 ${
            activeTab === 'home' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          🏠 <span>ホーム</span>
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex flex-col items-center py-1 ${
            activeTab === 'register' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          📝 <span>登録</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center py-1 ${
            activeTab === 'analytics' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          📊 <span>分析</span>
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center py-1 ${
            activeTab === 'search' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          🔍 <span>検索</span>
        </button>
      </nav>
    </main>
  );
}

