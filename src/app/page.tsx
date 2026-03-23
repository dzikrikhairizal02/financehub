'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Wallet, TrendingUp, TrendingDown, Trash2, Edit, Calendar, DollarSign, PieChart, BarChart3, LogOut, Download, Shield, Settings, Search, Filter, FileText, Sun, Moon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'
import { LockScreen } from '@/components/auth/LockScreen'
import { SetupPIN } from '@/components/auth/SetupPIN'
import { CategoryManager } from '@/components/category/CategoryManager'
import { TransactionFilters } from '@/components/filter/TransactionFilters'
import { FinancialReports } from '@/components/report/FinancialReports'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ChartsSection } from '@/components/dashboard/ChartsSection'

interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  date: string
  description?: string
  category: {
    id: string
    name: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
}

export default function Home() {
  const { isAuthenticated, isSetup, loading: authLoading, logout, login, getStoredPin, updateActivity, checkAuthStatus } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)
  const [isReportsOpen, setIsReportsOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as 'all' | 'income' | 'expense',
    categoryId: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  })

  // Handle PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallButton(false)
    }
  }

  // Fetch transactions and categories
  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories')
      ])

      if (catRes.ok) {
        const catData = await catRes.json()
        setCategories(catData)

        // If no categories exist, initialize database
        if (!catData || catData.length === 0) {
          try {
            await fetch('/api/init')
            // Fetch categories again after initialization
            const initCatRes = await fetch('/api/categories')
            if (initCatRes.ok) {
              setCategories(await initCatRes.json())
            }
          } catch (error) {
            console.error('Error initializing database:', error)
          }
        }
      }

      if (transRes.ok) {
        const transData = await transRes.json()
        setTransactions(transData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const balance = totalIncome - totalExpense

  // Form handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      type: formData.type,
      categoryId: formData.categoryId,
      description: formData.description || undefined,
      date: new Date(formData.date).toISOString()
    }

    try {
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions'
      
      const method = editingTransaction ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        await fetchData()
        resetForm()
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingTransaction(null)
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      title: transaction.title,
      amount: transaction.amount.toString(),
      type: transaction.type,
      categoryId: transaction.categoryId,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0]
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      categoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setEditingTransaction(null)
  }

  const filteredCategories = categories.filter(c => c.type === formData.type)

  // Filter transactions based on filters state
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        transaction.title.toLowerCase().includes(searchLower) ||
        transaction.category.name.toLowerCase().includes(searchLower) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchLower))
      if (!matchesSearch) return false
    }

    // Type filter
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false
    }

    // Category filter
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
      return false
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const transactionDate = new Date(transaction.date)
      if (filters.dateFrom && transactionDate < new Date(filters.dateFrom)) {
        return false
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (transactionDate > toDate) {
          return false
        }
      }
    }

    // Amount range filter
    if (filters.minAmount && transaction.amount < parseFloat(filters.minAmount)) {
      return false
    }
    if (filters.maxAmount && transaction.amount > parseFloat(filters.maxAmount)) {
      return false
    }

    return true
  })

  // Recalculate totals based on filtered transactions
  const filteredTotalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const filteredTotalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const filteredBalance = filteredTotalIncome - filteredTotalExpense

  // Prepare chart data from filtered transactions
  const monthlyData = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date)
    const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, income: 0, expense: 0 }
    }
    
    if (transaction.type === 'income') {
      acc[monthKey].income += transaction.amount
    } else {
      acc[monthKey].expense += transaction.amount
    }
    
    return acc
  }, {} as Record<string, { month: string; income: number; expense: number }>)

  const chartData = Object.values(monthlyData).slice(-6) // Last 6 months

  const categoryData = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const existing = acc.find(item => item.name === transaction.category.name)
      if (existing) {
        existing.value += transaction.amount
      } else {
        acc.push({
          name: transaction.category.name,
          value: transaction.amount,
          color: transaction.category.color
        })
      }
      return acc
    }, [] as { name: string; value: number; color: string }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 6) // Top 6 categories

  const handleLogout = async () => {
    await logout()
  }

  const handleUnlock = () => {
    checkAuthStatus()
  }

  const handleSetupComplete = (pin: string) => {
    checkAuthStatus()
  }

  // Auth & Loading states
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-foreground text-lg">Loading app...</div>
      </div>
    )
  }

  if (!isSetup) {
    return <SetupPIN onComplete={handleSetupComplete} />
  }

  if (!isAuthenticated) {
    return <LockScreen onUnlock={handleUnlock} storedPin={getStoredPin()} />
  }

  return (
    <div className="min-h-screen bg-background" onClick={updateActivity}>
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400">
                FinanceHub
              </h1>
              <p className="text-muted-foreground mt-1">Manajemen Keuangan Rumah Tangga</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {showInstallButton && (
                <Button
                  onClick={handleInstallClick}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 hidden sm:flex dark:border-cyan-500/30 dark:text-cyan-400 dark:hover:bg-cyan-500/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install App
                </Button>
              )}
              <Button
                onClick={() => setIsCategoryManagerOpen(true)}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 hidden sm:flex dark:border-purple-500/30 dark:text-purple-400 dark:hover:bg-purple-500/10"
              >
                <Settings className="mr-2 h-4 w-4" />
                Kategori
              </Button>
              <Button
                onClick={() => setIsReportsOpen(true)}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 hidden sm:flex dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10"
              >
                <FileText className="mr-2 h-4 w-4" />
                Laporan
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 border-0 dark:shadow-cyan-500/25"
                    onClick={resetForm}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Tambah Transaksi
                  </Button>
                </DialogTrigger>
              <DialogContent className="bg-card border-primary/30 text-card-foreground dark:bg-slate-900 dark:border-cyan-500/30 dark:text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400">
                    Add New Transaction
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Record your income or expense
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-primary dark:text-cyan-400">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-muted border-primary/30 text-card-foreground placeholder:text-muted-foreground focus:border-primary dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-primary dark:text-cyan-400">Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value, categoryId: '' })}>
                      <SelectTrigger className="bg-muted border-primary/30 text-card-foreground dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-primary/30 dark:bg-slate-800 dark:border-cyan-500/30">
                        <SelectItem value="income" className="text-green-500">Income</SelectItem>
                        <SelectItem value="expense" className="text-red-500">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-primary dark:text-cyan-400">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-muted border-primary/30 text-card-foreground placeholder:text-muted-foreground focus:border-primary dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-primary dark:text-cyan-400">Category</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger className="bg-muted border-primary/30 text-card-foreground dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-muted border-primary/30 dark:bg-slate-800 dark:border-cyan-500/30">
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-card-foreground dark:text-white">
                            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></span>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-primary dark:text-cyan-400">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-muted border-primary/30 text-card-foreground focus:border-primary dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-primary dark:text-cyan-400">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-muted border-primary/30 text-card-foreground placeholder:text-muted-foreground focus:border-primary min-h-[80px] dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 border-0 dark:shadow-cyan-500/25"
                  >
                    Save Transaction
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        <StatsCards 
          balance={filteredBalance}
          totalIncome={filteredTotalIncome}
          totalExpense={filteredTotalExpense}
          filteredCount={filteredTransactions.length}
          totalCount={transactions.length}
        />

        <ChartsSection 
          chartData={chartData}
          categoryData={categoryData}
        />

        {/* Transactions List */}
        <TransactionFilters
          categories={categories}
          filters={filters}
          onFiltersChange={setFilters}
        />

        <Card className="bg-card/80 backdrop-blur-sm border border-primary/30 shadow-lg dark:from-slate-900/80 dark:to-slate-800/80 dark:border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent flex items-center dark:from-cyan-400 dark:to-purple-400">
              <DollarSign className="mr-2 h-6 w-6" />
              Transaksi{filteredTransactions.length !== transactions.length && ` (${filteredTransactions.length} dari ${transactions.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">{transactions.length > 0 ? 'Tidak ada transaksi yang sesuai filter' : 'Belum ada transaksi'}</p>
                <p className="text-sm">{transactions.length > 0 ? 'Coba ubah filter atau reset' : 'Klik "Tambah Transaksi" untuk memulai'}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 group dark:bg-slate-800/50 dark:border-slate-700/50 dark:hover:border-cyan-500/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: transaction.category.color + '20',
                          border: `2px solid ${transaction.category.color}`
                        }}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-foreground font-semibold group-hover:text-primary transition-colors dark:text-white dark:group-hover:text-cyan-400">
                          {transaction.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: transaction.category.color }}></span>
                          <span>{transaction.category.name}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(transaction.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-xs text-muted-foreground mt-1">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`text-xl font-bold ${
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        Rp {transaction.amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(transaction)}
                          className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10 dark:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-primary/30 text-card-foreground dark:bg-slate-900 dark:border-cyan-500/30 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400">
              Edit Transaction
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your transaction details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-primary dark:text-cyan-400">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-muted border-primary/30 text-card-foreground placeholder:text-muted-foreground focus:border-primary dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-type" className="text-primary dark:text-cyan-400">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value, categoryId: '' })}>
                <SelectTrigger className="bg-muted border-primary/30 text-card-foreground dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-primary/30 dark:bg-slate-800 dark:border-cyan-500/30">
                  <SelectItem value="income" className="text-green-500">Income</SelectItem>
                  <SelectItem value="expense" className="text-red-500">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-amount" className="text-primary dark:text-cyan-400">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-muted border-primary/30 text-card-foreground placeholder:text-muted-foreground focus:border-primary dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-category" className="text-primary dark:text-cyan-400">Category</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger className="bg-muted border-primary/30 text-card-foreground dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-muted border-primary/30 dark:bg-slate-800 dark:border-cyan-500/30">
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-card-foreground dark:text-white">
                      <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></span>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-date" className="text-primary dark:text-cyan-400">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-muted border-primary/30 text-card-foreground focus:border-primary dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white dark:focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-primary dark:text-cyan-400">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-muted border-primary/30 text-card-foreground placeholder:text-muted-foreground focus:border-primary min-h-[80px] dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 border-0 dark:shadow-cyan-500/25"
            >
              Update Transaction
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Financial Reports */}
      <FinancialReports
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
      />

      {/* Category Manager */}
      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onCategoryChange={fetchData}
      />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border backdrop-blur-sm bg-background/80 py-4 dark:border-cyan-500/20 dark:bg-slate-950/80">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 FinanceHub - Your Futuristic Financial Companion</p>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
      `}</style>
    </div>
  )
}
