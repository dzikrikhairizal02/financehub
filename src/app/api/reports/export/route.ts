import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET export transactions as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'
    const format = searchParams.get('format') || 'csv'

    let dateFilter: any = {}

    // Apply date filter
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    switch (period) {
      case 'this-month':
        dateFilter = {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
        break
      case 'last-month':
        dateFilter = {
          gte: new Date(currentYear, currentMonth - 2, 1),
          lt: new Date(currentYear, currentMonth - 1, 1)
        }
        break
      case 'this-year':
        dateFilter = {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1)
        }
        break
      case 'last-year':
        dateFilter = {
          gte: new Date(currentYear - 1, 0, 1),
          lt: new Date(currentYear, 0, 1)
        }
        break
    }

    const transactions = await db.transaction.findMany({
      where: dateFilter ? {
        date: dateFilter
      } : undefined,
      include: {
        category: true
      },
      orderBy: { date: 'desc' }
    })

    // Generate CSV
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Description']
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.title,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category.name,
      t.amount.toString(),
      t.description || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const filename = `laporan-keuangan-${period}-${now.toISOString().split('T')[0]}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error exporting transactions:', error)
    return NextResponse.json({ error: 'Failed to export transactions' }, { status: 500 })
  }
}
