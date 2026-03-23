'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatsCardsProps {
  balance: number
  totalIncome: number
  totalExpense: number
  filteredCount: number
  totalCount: number
}

export function StatsCards({ balance, totalIncome, totalExpense, filteredCount, totalCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Balance Card */}
      <Card className="bg-card border group hover:border-primary/50 transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Rp {balance.toLocaleString('id-ID')}
          </div>
          {filteredCount !== totalCount && (
            <p className="text-xs text-muted-foreground mt-2">
              {filteredCount} dari {totalCount} transaksi
            </p>
          )}
        </CardContent>
      </Card>

      {/* Income Card */}
      <Card className="bg-card border-green-500/20 group hover:border-green-400/50 transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-green-600">
            +Rp {totalIncome.toLocaleString('id-ID')}
          </div>
        </CardContent>
      </Card>

      {/* Expense Card */}
      <Card className="bg-card border-red-500/20 group hover:border-red-400/50 transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-red-600">
            -Rp {totalExpense.toLocaleString('id-ID')}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

