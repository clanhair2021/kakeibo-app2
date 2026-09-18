'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type Expense = {
  id: string
  date: string
  amount: number
  merchant_name: string
  category: string
  expense_type: 'variable' | 'fixed' | 'business'
  payer: string
  payment_method: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'register' | 'search'>('register')
  
  // フォーム用ステート
  const [amount, setAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [category, setCategory] = useState('食費')
  const [expenseType, setExpenseType] = useState<'variable' | 'fixed' | 'business'>('variable')
  const [payer, setPayer] = useState('共通')
  const [paymentMethod, setPaymentMethod] = useState('現金')
  const [loading, setLoading] = useState(false)

  // 一覧・検索用ステート
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [fetching, setFetching] = useState(false)

  // データを取得する関数
  const fetchExpenses = async () => {
    setFetching(true)
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error)
    } else {
      setExpenses(data || [])
    }
    setFetching(false)
  }

  // 初回およびタブ切り替え時にデータ取得
  useEffect(() => {
    fetchExpenses()
  }, [])

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !merchant) {
      alert('金額と店舗名を入力してください')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('expenses').insert([
      {
        amount: Number(amount),
        merchant_name: merchant,
        category,
        expense_type: expenseType,
        payer,
        payment_method: paymentMethod,
      },
    ])

    setLoading(false)

    if (error) {
      alert(`エラー: ${error.message}`)
    } else {
      alert('登録完了しました！')
      setAmount('')
      setMerchant('')
      fetchExpenses() // 保存後に一覧を更新
    }
  }

  // 検索フィルタリング
  const filteredExpenses = expenses.filter((item) =>
    item.merchant_name?.includes(searchQuery) || item.category?.includes(searchQuery)
  )

  return (
    <main className="max-w-md mx-auto min-h-screen bg-slate-900 text-white pb-20">
      {/* ヘッダー */}
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold text-lg">🏠 共有家計簿 & 経費</h1>
      </header>

      <div className="p-4">
        {/* ホームタブ（一覧） */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex justify-between items-center">
              <span>📋 登録履歴</span>
              <button onClick={fetchExpenses} className="text-xs bg-slate-700 px-2 py-1 rounded">更新</button>
            </h2>
            {fetching ? (
              <p className="text-slate-400 text-center py-8">読み込み中...</p>
            ) : expenses.length === 0 ? (
              <p className="text-slate-400 text-center py-8">データがまだありません</p>
            ) : (
              <div className="space-y-2">
                {expenses.map((item) => (
                  <div key={item.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{item.merchant_name}</div>
                      <div className="text-xs text-slate-400">
                        {item.category} • {item.payer} • {item.payment_method}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">¥{item.amount.toLocaleString()}</div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        item.expense_type === 'variable' ? 'bg-blue-900 text-blue-200' :
                        item.expense_type === 'fixed' ? 'bg-purple-900 text-purple-200' : 'bg-amber-900 text-amber-200'
                      }`}>
                        {item.expense_type === 'variable' ? '変動費' : item.expense_type === 'fixed' ? '固定費' : '事業'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 登録タブ */}
        {activeTab === 'register' && (
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h2 className="text-lg font-bold mb-4">📝 手入力登録</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">金額 (円)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">店舗・支払先</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="スーパー・コンビニ等"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">区分</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['variable', 'fixed', 'business'] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setExpenseType(type)}
                      className={`p-2 text-xs rounded border ${
                        expenseType === type
                          ? 'bg-blue-600 border-blue-500 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      {type === 'variable' ? '変動費' : type === 'fixed' ? '固定費' : '事業経費'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">カテゴリー</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="食費">食費</option>
                  <option value="日用品">日用品</option>
                  <option value="光熱費">光熱費</option>
                  <option value="交通費">交通費</option>
                  <option value="娯楽">娯楽</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition"
              >
                {loading ? '保存中...' : '保存する'}
              </button>
            </form>
          </div>
        )}

        {/* 検索タブ */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">🔍 検索</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="店舗名やカテゴリーで検索..."
              className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white"
            />
            <div className="space-y-2">
              {filteredExpenses.map((item) => (
                <div key={item.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{item.merchant_name}</div>
                    <div className="text-xs text-slate-400">{item.category}</div>
                  </div>
                  <div className="font-bold text-emerald-400">¥{item.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-800 border-t border-slate-700 flex justify-around p-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center text-xs ${activeTab === 'home' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <span>📊</span>
          <span>ホーム</span>
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex flex-col items-center text-xs ${activeTab === 'register' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <span>📝</span>
          <span>登録</span>
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center text-xs ${activeTab === 'search' ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
        >
          <span>🔍</span>
          <span>検索</span>
        </button>
      </nav>
    </main>
  )
}

