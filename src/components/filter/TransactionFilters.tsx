'use client'

import { useState } from 'react'
import { Search, X, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
}

interface TransactionFiltersProps {
  categories: Category[]
  filters: {
    search: string
    type: 'all' | 'income' | 'expense'
    categoryId: string
    dateFrom: string
    dateTo: string
    minAmount: string
    maxAmount: string
  }
  onFiltersChange: (filters: any) => void
}

export function TransactionFilters({ categories, filters, onFiltersChange }: TransactionFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const hasActiveFilters =
    filters.search ||
    filters.type !== 'all' ||
    filters.categoryId ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minAmount ||
    filters.maxAmount

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      categoryId: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    })
  }

  const filteredCategories = categories.filter(c => {
    if (filters.type === 'all') return true
    return c.type === filters.type
  })

  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-primary/30 mb-6 dark:bg-slate-900/80 dark:border-cyan-500/30">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi berdasarkan nama, kategori, atau deskripsi..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="bg-muted border-primary/30 text-foreground pl-10 pr-10 dark:bg-slate-800/50 dark:border-cyan-500/30 dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-500"
            />
            {filters.search && (
              <button
                onClick={() => onFiltersChange({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`border-primary/30 text-primary hover:bg-primary/10 dark:border-cyan-500/30 dark:text-cyan-400 dark:hover:bg-cyan-500/10 ${hasActiveFilters ? 'bg-primary/10 dark:bg-cyan-500/10' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && <span className="ml-2 bg-primary text-primary-foreground dark:bg-cyan-500 dark:text-white text-xs px-2 py-0.5 rounded-full">Aktif</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-card border-primary/30 text-foreground w-80 max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-cyan-500/30 dark:text-white">
              <div className="space-y-4">
                <div>
                  <Label className="text-primary text-sm dark:text-cyan-400">Tipe Transaksi</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => onFiltersChange({ ...filters, type: value, categoryId: '' })}
                  >
                    <SelectTrigger className="bg-muted border-primary/30 text-foreground mt-1 dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-muted border-primary/30 dark:bg-slate-800 dark:border-cyan-500/30">
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="income" className="text-green-600 dark:text-green-400">Pemasukan</SelectItem>
                      <SelectItem value="expense" className="text-red-600 dark:text-red-400">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-primary text-sm dark:text-cyan-400">Kategori</Label>
                  <Select
                    value={filters.categoryId}
                    onValueChange={(value) => onFiltersChange({ ...filters, categoryId: value })}
                    disabled={filters.type !== 'all'}
                  >
                    <SelectTrigger className="bg-muted border-primary/30 text-foreground mt-1 dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white">
                      <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-muted border-primary/30 max-h-60 dark:bg-slate-800 dark:border-cyan-500/30">
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-foreground dark:text-white">
                          <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></span>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filters.type !== 'all' && (
                    <p className="text-xs text-muted-foreground mt-1 dark:text-slate-500">Pilih "Semua" tipe untuk filter kategori</p>
                  )}
                </div>

                <div>
                  <Label className="text-primary text-sm flex items-center dark:text-cyan-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    Rentang Tanggal
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                      className="bg-muted border-primary/30 text-foreground dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white"
                      placeholder="Dari"
                    />
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                      className="bg-muted border-primary/30 text-foreground dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white"
                      placeholder="Sampai"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-primary text-sm dark:text-cyan-400">Rentang Jumlah (Rp)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => onFiltersChange({ ...filters, minAmount: e.target.value })}
                      className="bg-muted border-primary/30 text-foreground dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white"
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => onFiltersChange({ ...filters, maxAmount: e.target.value })}
                      className="bg-muted border-primary/30 text-foreground dark:bg-slate-800 dark:border-cyan-500/30 dark:text-white"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 dark:text-red-400"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reset Semua Filter
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
}
