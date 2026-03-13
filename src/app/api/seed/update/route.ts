import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Get all existing categories
    const existingCategories = await db.category.findMany()
    const existingNames = new Set(existingCategories.map(c => c.name))

    // Define comprehensive default categories
    const incomeCategories = [
      { name: 'Gaji Bulanan', type: 'income', color: '#22c55e', icon: '💰' },
      { name: 'Bonus', type: 'income', color: '#10b981', icon: '🎁' },
      { name: 'Freelance', type: 'income', color: '#14b8a6', icon: '💼' },
      { name: 'Investasi', type: 'income', color: '#06b6d4', icon: '📈' },
      { name: 'Deviden Saham', type: 'income', color: '#0ea5e9', icon: '📊' },
      { name: 'Bunga Bank', type: 'income', color: '#3b82f6', icon: '🏦' },
      { name: 'Hadiah', type: 'income', color: '#8b5cf6', icon: '🎀' },
      { name: 'Penjualan Barang', type: 'income', color: '#ec4899', icon: '🛍️' },
      { name: 'Uang Kembalian', type: 'income', color: '#f43f5e', icon: '💸' },
      { name: 'Lainnya', type: 'income', color: '#64748b', icon: '📌' }
    ]

    const expenseCategories = [
      { name: 'Makanan & Minuman', type: 'expense', color: '#ef4444', icon: '🍽️' },
      { name: 'Belanja Harian', type: 'expense', color: '#f97316', icon: '🛒' },
      { name: 'Transportasi', type: 'expense', color: '#eab308', icon: '🚗' },
      { name: 'Bensin & BBM', type: 'expense', color: '#ca8a04', icon: '⛽' },
      { name: 'Parkir', type: 'expense', color: '#a16207', icon: '🅿️' },
      { name: 'Tol', type: 'expense', color: '#854d0e', icon: '🛣️' },
      { name: 'Listrik', type: 'expense', color: '#84cc16', icon: '💡' },
      { name: 'Air', type: 'expense', color: '#22c55e', icon: '💧' },
      { name: 'Internet & TV', type: 'expense', color: '#10b981', icon: '📺' },
      { name: 'Telepon', type: 'expense', color: '#14b8a6', icon: '📱' },
      { name: 'Sewa Rumah', type: 'expense', color: '#06b6d4', icon: '🏠' },
      { name: 'Cicilan Rumah', type: 'expense', color: '#0ea5e9', icon: '🏘️' },
      { name: 'Pajak Rumah', type: 'expense', color: '#3b82f6', icon: '📋' },
      { name: 'Perbaikan Rumah', type: 'expense', color: '#6366f1', icon: '🔧' },
      { name: 'Rumah Tangga', type: 'expense', color: '#8b5cf6', icon: '🧹' },
      { name: 'Dokter & Obat', type: 'expense', color: '#ec4899', icon: '🏥' },
      { name: 'Asuransi Kesehatan', type: 'expense', color: '#f43f5e', icon: '🩺' },
      { name: 'Suplemen & Vitamin', type: 'expense', color: '#e11d48', icon: '💊' },
      { name: 'Olahraga & Fitness', type: 'expense', color: '#be123c', icon: '🏋️' },
      { name: 'Sekolah', type: 'expense', color: '#9f1239', icon: '📚' },
      { name: 'Kursus', type: 'expense', color: '#881337', icon: '📝' },
      { name: 'Buku', type: 'expense', color: '#4c0519', icon: '📖' },
      { name: 'Nonton Bioskop', type: 'expense', color: '#fbbf24', icon: '🎬' },
      { name: 'Streaming', type: 'expense', color: '#f59e0b', icon: '🎥' },
      { name: 'Game', type: 'expense', color: '#d97706', icon: '🎮' },
      { name: 'Konser', type: 'expense', color: '#b45309', icon: '🎵' },
      { name: 'Liburan', type: 'expense', color: '#92400e', icon: '✈️' },
      { name: 'Pakaian', type: 'expense', color: '#78350f', icon: '👕' },
      { name: 'Sepatu', type: 'expense', color: '#713f12', icon: '👟' },
      { name: 'Aksesoris', type: 'expense', color: '#a8a29e', icon: '💍' },
      { name: 'Perawatan Wajah', type: 'expense', color: '#d6d3d1', icon: '😊' },
      { name: 'Salon', type: 'expense', color: '#a8a29e', icon: '💇' },
      { name: 'Sus & Popok', type: 'expense', color: '#78716c', icon: '🍼' },
      { name: 'Pendidikan Anak', type: 'expense', color: '#71716b', icon: '🧒' },
      { name: 'Mainan Anak', type: 'expense', color: '#6c7077', icon: '🧸' },
      { name: 'Makanan Hewan', type: 'expense', color: '#64748b', icon: '🐕' },
      { name: 'Kesehatan Hewan', type: 'expense', color: '#57534e', icon: '🐾' },
      { name: 'Zakat', type: 'expense', color: '#44403c', icon: '🤲' },
      { name: 'Sedekah', type: 'expense', color: '#78716c', icon: '❤️' },
      { name: 'Tabungan', type: 'expense', color: '#292524', icon: '🐷' },
      { name: 'Investasi', type: 'expense', color: '#1c1917', icon: '📈' },
      { name: 'Cicilan Motor', type: 'expense', color: '#0c0a09', icon: '🏍️' },
      { name: 'Cicilan Mobil', type: 'expense', color: '#18181b', icon: '🚙' },
      { name: 'Kartu Kredit', type: 'expense', color: '#27272a', icon: '💳' },
      { name: 'Pinjaman', type: 'expense', color: '#3f3f46', icon: '📝' },
      { name: 'Lainnya', type: 'expense', color: '#52525b', icon: '📌' }
    ]

    // Filter only missing categories
    const allCategories = [...incomeCategories, ...expenseCategories]
    const missingCategories = allCategories.filter(cat => !existingNames.has(cat.name))

    if (missingCategories.length === 0) {
      return NextResponse.json({
        message: 'All categories already exist',
        existingCount: existingCategories.length,
        addedCount: 0
      })
    }

    // Add missing categories
    await db.category.createMany({
      data: missingCategories
    })

    return NextResponse.json({
      message: 'Categories updated successfully',
      existingCount: existingCategories.length,
      addedCount: missingCategories.length,
      addedCategories: missingCategories.map(c => c.name)
    })
  } catch (error) {
    console.error('Error updating categories:', error)
    return NextResponse.json({ error: 'Failed to update categories' }, { status: 500 })
  }
}
