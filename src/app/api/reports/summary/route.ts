import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET financial summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // 'all', 'this-month', 'last-month', 'this-year', 'last-year'
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    let dateFilter: any = {}

    // Apply date filter based on period
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
      case 'custom':
        if (year && month) {
          dateFilter = {
            gte: new Date(parseInt(year), parseInt(month) - 1, 1),
            lt: new Date(parseInt(year), parseInt(month), 1)
          }
        }
        break
    }

    // Fetch transactions
    const transactions = await db.transaction.findMany({
      where: dateFilter ? {
        date: dateFilter
      } : undefined,
      include: {
        category: true
      },
      orderBy: { date: 'desc' }
    })

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    // Group by category
    const categoryBreakdown = transactions.reduce((acc, t) => {
      if (!acc[t.categoryId]) {
        acc[t.categoryId] = {
          name: t.category.name,
          color: t.category.color,
          type: t.category.type,
          total: 0,
          count: 0
        }
      }
      acc[t.categoryId].total += t.amount
      acc[t.categoryId].count += 1
      return acc
    }, {} as Record<string, any>)

    // Calculate monthly trends if period is 'all' or 'this-year'
    let monthlyTrend = []
    if (period === 'all' || period === 'this-year') {
      const months: Record<string, { income: number; expense: number }> = {}
      
      transactions.forEach(t => {
        const date = new Date(t.date)
        const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
        
        if (!months[monthKey]) {
          months[monthKey] = { income: 0, expense: 0 }
        }
        
        if (t.type === 'income') {
          months[monthKey].income += t.amount
        } else {
          months[monthKey].expense += t.amount
        }
      })

      monthlyTrend = Object.entries(months).map(([month, data]) => ({
        month,
        ...data
      })).slice(-6) // Last 6 months
    }

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length
      },
      categoryBreakdown: Object.values(categoryBreakdown),
      monthlyTrend,
      period
    })
  } catch (error) {
    console.error('Error fetching report summary:', error)
    return NextResponse.json({ error: 'Failed to fetch report summary' }, { status: 500 })
  }
}
