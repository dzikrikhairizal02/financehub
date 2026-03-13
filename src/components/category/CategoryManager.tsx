'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Card, CardContent } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon?: string | null
}

const PREDEFINED_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#64748b', '#78716c', '#a8a29e', '#d6d3d1'
]

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  onCategoryChange: () => void
}

export function CategoryManager({ isOpen, onClose, onCategoryChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: PREDEFINED_COLORS[0],
    icon: ''
  })

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: PREDEFINED_COLORS[0],
      icon: ''
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        await fetchCategories()
        resetForm()
        onCategoryChange()
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleUpdate = async () => {
    if (!editingId) return

    try {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        await fetchCategories()
        resetForm()
        onCategoryChange()
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDelete = async (id: string, name: string, transactionCount?: number) => {
    if (transactionCount && transactionCount > 0) {
      alert(`Tidak bisa menghapus kategori "${name}" karena masih ada ${transactionCount} transaksi yang menggunakan kategori ini.`)
      return
    }

    if (!confirm(`Yakin ingin menghapus kategori "${name}"?`)) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await fetchCategories()
        onCategoryChange()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus kategori')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon || ''
    })
    setIsAdding(true)
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card border-primary/30 text-foreground max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-cyan-500/30 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-purple-400">
              Manajemen Kategori
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Memuat kategori...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-primary dark:text-cyan-400">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary/30 text-foreground max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-cyan-500/30 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-purple-400">
            Manajemen Kategori
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tambah, edit, atau hapus kategori sesuai kebutuhan keuangan rumah tangga Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {isAdding && (
            <Card className="bg-muted/50 border-primary/30 dark:bg-slate-800/50 dark:border-cyan-500/30">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cat-name" className="text-primary dark:text-cyan-400">Nama Kategori</Label>
                    <Input
                      id="cat-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background border-primary/30 text-foreground mt-1 dark:bg-slate-700/50 dark:border-cyan-500/30 dark:text-white"
                      placeholder="Contoh: Makan, Transportasi, Gaji"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cat-type" className="text-primary dark:text-cyan-400">Tipe</Label>
                    <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="bg-background border-primary/30 text-foreground mt-1 dark:bg-slate-700/50 dark:border-cyan-500/30 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-primary/30 dark:bg-slate-800 dark:border-cyan-500/30">
                        <SelectItem value="income" className="text-green-600 dark:text-green-400">Pemasukan</SelectItem>
                        <SelectItem value="expense" className="text-red-600 dark:text-red-400">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cat-color" className="text-primary dark:text-cyan-400">Warna</Label>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {PREDEFINED_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color ? 'border-foreground scale-110 dark:border-white' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cat-icon" className="text-primary dark:text-cyan-400">Icon (Emoji, opsional)</Label>
                    <Input
                      id="cat-icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="bg-background border-primary/30 text-foreground mt-1 dark:bg-slate-700/50 dark:border-cyan-500/30 dark:text-white"
                      placeholder="Contoh: 🛒, 🚗, 💡"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={editingId ? handleUpdate : handleAdd}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="border-border text-foreground hover:bg-muted dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kategori Baru
            </Button>
          )}

          {/* Income Categories */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
              <span className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full mr-2" />
              Kategori Pemasukan ({incomeCategories.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {incomeCategories.map((category) => (
                <Card
                  key={category.id}
                  className="bg-muted/50 border border-border hover:border-green-500/50 transition-all group dark:bg-slate-800/50 dark:border-slate-700/50 dark:hover:border-green-500/50"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          {category.icon || '📊'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground dark:text-white">{category.name}</p>
                          <span className="inline-block w-2 h-2 rounded-full mt-1" style={{ backgroundColor: category.color }}></span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10 dark:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id, category.name)}
                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
              <span className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full mr-2" />
              Kategori Pengeluaran ({expenseCategories.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {expenseCategories.map((category) => (
                <Card
                  key={category.id}
                  className="bg-muted/50 border border-border hover:border-red-500/50 transition-all group dark:bg-slate-800/50 dark:border-slate-700/50 dark:hover:border-red-500/50"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          {category.icon || '📊'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground dark:text-white">{category.name}</p>
                          <span className="inline-block w-2 h-2 rounded-full mt-1" style={{ backgroundColor: category.color }}></span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10 dark:text-cyan-400 dark:hover:text-cyan-300 dark:hover:bg-cyan-500/10"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id, category.name)}
                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
