'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from 'recharts'

interface FinancialReportsProps {
  isOpen: boolean
  onClose: () => void
}

interface ReportData {
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    transactionCount: number
  }
  categoryBreakdown: Array<{
    name: string
    color: string
    type: string
    total: number
    count: number
  }>
  monthlyTrend: Array<{
    month: string
    income: number
    expense: number
  }>
  period: string
}

export function FinancialReports({ isOpen, onClose }: FinancialReportsProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('all')

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/summary?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchReport()
    }
  }, [isOpen, period])

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/reports/export?period=${period}&format=csv`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan-keuangan-${period}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Gagal mengekspor laporan')
    }
  }

  if (loading && !reportData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card border-primary/30 text-foreground max-w-5xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-cyan-500/30 dark:text-white">
          <div className="flex items-center justify-center py-8">
            <div className="text-primary dark:text-cyan-400">Memuat laporan...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/30 text-foreground max-w-6xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-cyan-500/30 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent flex items-center dark:from-cyan-400 dark:to-purple-400">
            <FileText className="mr-2 h-6 w-6" />
            Laporan Keuangan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Analisis mendalam tentang keuangan rumah tangga Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Period Selector & Export */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary dark:text-cyan-400" />
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="bg-muted border-primary/30 text-foreground w-48 dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-muted border-primary/30 dark:bg-slate-800 dark:border-cyan-500/30">
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="this-month">Bulan Ini</SelectItem>
                  <SelectItem value="last-month">Bulan Lalu</SelectItem>
                  <SelectItem value="this-year">Tahun Ini</SelectItem>
                  <SelectItem value="last-year">Tahun Lalu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExport}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {reportData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-muted/50 border-primary/30 shadow-lg overflow-hidden dark:bg-slate-800/50 dark:border-cyan-500/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-muted-foreground text-sm font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Total Transaksi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-foreground dark:text-white">
                      {reportData.summary.transactionCount}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-green-500/30 shadow-lg overflow-hidden dark:bg-slate-800/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-muted-foreground text-sm font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Total Pemasukan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      +Rp {reportData.summary.totalIncome.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-red-500/30 shadow-lg overflow-hidden dark:bg-slate-800/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-muted-foreground text-sm font-medium flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Total Pengeluaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      -Rp {reportData.summary.totalExpense.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50 border-purple-500/30 shadow-lg overflow-hidden dark:bg-slate-800/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-muted-foreground text-sm font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Saldo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-3xl font-bold ${reportData.summary.balance >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-red-600 dark:text-red-400'}`}>
                      Rp {reportData.summary.balance.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trend Chart */}
              {reportData.monthlyTrend.length > 0 && (
                <Card className="bg-muted/50 border-primary/30 dark:bg-slate-800/50 dark:border-cyan-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground dark:text-white">Tren Bulanan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={reportData.monthlyTrend}>
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 211, 238, 0.1)" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          stroke="rgba(148, 163, 184, 0.2)"
                        />
                        <YAxis
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          stroke="rgba(148, 163, 184, 0.2)"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(34, 211, 238, 0.3)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                        />
                        <Area
                          type="monotone"
                          dataKey="income"
                          stroke="#22c55e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#incomeGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="expense"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#expenseGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income by Category */}
                <Card className="bg-muted/50 border-green-500/30 dark:bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground dark:text-white">Pemasukan per Kategori</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportData.categoryBreakdown.filter(c => c.type === 'income').length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Pie
                            data={reportData.categoryBreakdown.filter(c => c.type === 'income')}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => `${((entry.total / reportData.summary.totalIncome) * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {reportData.categoryBreakdown.filter(c => c.type === 'income').map((entry, index) => (
                              <Cell key={`income-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(34, 211, 238, 0.3)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                          />
                          <Legend
                            wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }}
                            iconType="circle"
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        Tidak ada data pemasukan
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Expense by Category */}
                <Card className="bg-muted/50 border-red-500/30 dark:bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground dark:text-white">Pengeluaran per Kategori</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportData.categoryBreakdown.filter(c => c.type === 'expense').length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Pie
                            data={reportData.categoryBreakdown.filter(c => c.type === 'expense')}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry) => `${((entry.total / reportData.summary.totalExpense) * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {reportData.categoryBreakdown.filter(c => c.type === 'expense').map((entry, index) => (
                              <Cell key={`expense-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid rgba(34, 211, 238, 0.3)',
                              borderRadius: '8px',
                              color: '#fff'
                            }}
                            formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                          />
                          <Legend
                            wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }}
                            iconType="circle"
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        Tidak ada data pengeluaran
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Category Breakdown Table */}
              <Card className="bg-muted/50 border-primary/30 dark:bg-slate-800/50 dark:border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground dark:text-white">Detail per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-muted-foreground text-sm border-b border-border dark:border-slate-700">
                          <th className="pb-3 pr-4">Kategori</th>
                          <th className="pb-3 pr-4">Tipe</th>
                          <th className="pb-3 pr-4 text-right">Jumlah</th>
                          <th className="pb-3 text-right">Transaksi</th>
                          <th className="pb-3 text-right">Persentase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.categoryBreakdown
                          .sort((a, b) => b.total - a.total)
                          .map((cat) => {
                            const total = cat.type === 'income' ? reportData.summary.totalIncome : reportData.summary.totalExpense
                            const percentage = total > 0 ? ((cat.total / total) * 100).toFixed(1) : '0'
                            return (
                              <tr key={cat.name} className="text-sm border-b border-border/50 dark:border-slate-700/50">
                                <td className="py-3 pr-4">
                                  <div className="flex items-center">
                                    <span
                                      className="inline-block w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="text-foreground dark:text-white">{cat.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 pr-4">
                                  <span className={cat.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                  </span>
                                </td>
                                <td className="py-3 pr-4 text-right text-foreground dark:text-white">
                                  Rp {cat.total.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </td>
                                <td className="py-3 pr-4 text-right text-muted-foreground dark:text-slate-300">
                                  {cat.count}
                                </td>
                                <td className="py-3 text-right text-foreground dark:text-white">
                                  {percentage}%
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
