'use client'

import { useState } from 'react'
import { Search, Home, ShoppingCart, List, User, Check, X, Refrigerator, ChevronRight, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type FoodItem = {
  id: string
  name: string
  category: string
  inStock: boolean
  icon: string
  image?: string
}

const CATEGORIES = ['すべて', '野菜', '肉・魚', '乳製品', '調味料', 'その他']

const FOOD_ITEMS: FoodItem[] = [
  { id: '1', name: 'にんじん', category: '野菜', inStock: true, icon: '🥕' },
  { id: '2', name: 'たまねぎ', category: '野菜', inStock: true, icon: '🧅' },
  { id: '3', name: 'じゃがいも', category: '野菜', inStock: false, icon: '🥔' },
  { id: '4', name: 'トマト', category: '野菜', inStock: true, icon: '🍅' },
  { id: '5', name: 'レタス', category: '野菜', inStock: false, icon: '🥬' },
  { id: '6', name: 'きゅうり', category: '野菜', inStock: true, icon: '🥒' },
  { id: '7', name: 'なす', category: '野菜', inStock: false, icon: '🍆' },
  { id: '8', name: '鶏むね肉', category: '肉・魚', inStock: true, icon: '🍗' },
  { id: '9', name: '豚バラ肉', category: '肉・魚', inStock: false, icon: '🥓' },
  { id: '10', name: 'サーモン', category: '肉・魚', inStock: true, icon: '🐟' },
  { id: '11', name: '牛肉', category: '肉・魚', inStock: false, icon: '🥩' },
  { id: '12', name: '牛乳', category: '乳製品', inStock: true, icon: '🥛' },
  { id: '13', name: 'ヨーグルト', category: '乳製品', inStock: false, icon: '🥄' },
  { id: '14', name: 'チーズ', category: '乳製品', inStock: true, icon: '🧀' },
  { id: '15', name: 'バター', category: '乳製品', inStock: false, icon: '🧈' },
  { id: '16', name: '醤油', category: '調味料', inStock: true, icon: '🍶' },
  { id: '17', name: 'みりん', category: '調味料', inStock: false, icon: '🍶' },
  { id: '18', name: '塩', category: '調味料', inStock: true, icon: '🧂' },
  { id: '19', name: '砂糖', category: '調味料', inStock: true, icon: '🍯' },
  { id: '20', name: '卵', category: 'その他', inStock: true, icon: '🥚' },
  { id: '21', name: 'パン', category: 'その他', inStock: false, icon: '🍞' },
]

export type FridgeInventoryProps = {
  items?: FoodItem[]
  categories?: string[]
  className?: string
}

export function FridgeInventory({ items = FOOD_ITEMS, categories = CATEGORIES, className }: FridgeInventoryProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [foodItems, setFoodItems] = useState<FoodItem[]>(items)
  const [activeTab, setActiveTab] = useState('home')
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all')

  const toggleStock = (id: string) => {
    setFoodItems(items =>
      items.map(item =>
        item.id === id ? { ...item, inStock: !item.inStock } : item
      )
    )
  }

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'すべて' || item.category === selectedCategory
    const matchesStock = 
      stockFilter === 'all' ? true :
      stockFilter === 'inStock' ? item.inStock :
      !item.inStock
    return matchesSearch && matchesCategory && matchesStock
  })

  return (
    <div className={cn("flex flex-col h-screen max-w-md mx-auto bg-background", className)}>
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10">
        <div className="p-4 pb-3">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Refrigerator className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground tracking-tight">冷蔵庫管理</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="食材を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted/50 text-foreground border border-border/50 shadow-sm hover:bg-muted/70 focus:bg-card transition-colors rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-2 bg-background/50 backdrop-blur-sm">
        <div className="flex gap-2 mb-3">
          <Button
            variant={stockFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStockFilter('all')}
            className={cn(
              'flex-1 h-9 rounded-lg font-medium transition-all duration-200',
              stockFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg'
                : 'bg-card text-foreground hover:bg-muted border border-border/50 shadow-sm'
            )}
          >
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            すべて
          </Button>
          <Button
            variant={stockFilter === 'inStock' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStockFilter('inStock')}
            className={cn(
              'flex-1 h-9 rounded-lg font-medium transition-all duration-200',
              stockFilter === 'inStock'
                ? 'bg-accent text-accent-foreground shadow-md hover:shadow-lg'
                : 'bg-card text-foreground hover:bg-muted border border-border/50 shadow-sm'
            )}
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            在庫あり
          </Button>
          <Button
            variant={stockFilter === 'outOfStock' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStockFilter('outOfStock')}
            className={cn(
              'flex-1 h-9 rounded-lg font-medium transition-all duration-200',
              stockFilter === 'outOfStock'
                ? 'bg-secondary text-secondary-foreground shadow-md hover:shadow-lg'
                : 'bg-card text-foreground hover:bg-muted border border-border/50 shadow-sm'
            )}
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            在庫なし
          </Button>
        </div>
      </div>

      <div className="px-4 pb-3 bg-background/50 backdrop-blur-sm relative">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'whitespace-nowrap h-8 px-4 rounded-full font-medium transition-all duration-200',
                selectedCategory === category
                  ? 'bg-secondary text-secondary-foreground shadow-md scale-105'
                  : 'bg-card text-foreground border border-border/50 hover:bg-muted shadow-sm hover:scale-105'
              )}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background/50 via-background/40 to-transparent pl-8 pr-1 pointer-events-none">
          <ChevronRight className="h-4 w-4 text-muted-foreground/60 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="space-y-2 py-3">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleStock(item.id)}
              className={cn(
                'w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 active:scale-[0.98]',
                item.inStock
                  ? 'bg-accent/10 border border-accent/30 shadow-sm hover:shadow-md hover:border-accent/50'
                  : 'bg-card border border-border/50 shadow-sm hover:shadow-md hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-inner transition-all duration-200',
                    item.inStock ? 'bg-accent/20 ring-1 ring-accent/30' : 'bg-muted/70'
                  )}
                >
                  {item.icon}
                </div>
                <div className="text-left">
                  <p className={cn(
                    'font-medium text-[15px] leading-tight',
                    item.inStock ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {item.name}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{item.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-200',
                    item.inStock ? 'bg-accent ring-1 ring-accent/50' : 'bg-muted'
                  )}
                >
                  {item.inStock ? (
                    <Check className="h-3.5 w-3.5 text-accent-foreground" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </button>
          ))}
          {filteredItems.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Refrigerator className="h-14 w-14 mx-auto mb-4 opacity-30" />
              <p className="text-base font-medium">該当する食材が見つかりません</p>
              <p className="text-sm mt-1.5">検索条件を変更してください</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/80 backdrop-blur-xl border-t border-border/50 shadow-lg">
        <div className="flex justify-around items-center py-2 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('home')}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 h-14 rounded-lg transition-all duration-200',
              activeTab === 'home' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-[11px] font-medium">ホーム</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('shopping')}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 h-14 rounded-lg transition-all duration-200',
              activeTab === 'shopping' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-[11px] font-medium">買い物</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('list')}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 h-14 rounded-lg transition-all duration-200',
              activeTab === 'list' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <List className="h-5 w-5" />
            <span className="text-[11px] font-medium">リスト</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('profile')}
            className={cn(
              'flex flex-col items-center gap-1 flex-1 h-14 rounded-lg transition-all duration-200',
              activeTab === 'profile' 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-[11px] font-medium">設定</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
