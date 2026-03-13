import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all transactions
export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      include: {
        category: true
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST create transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, amount, type, categoryId, description, date } = body

    if (!title || !amount || !type || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, amount, type, categoryId' },
        { status: 400 }
      )
    }

    const transaction = await db.transaction.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        categoryId,
        description: description || null,
        date: date ? new Date(date) : new Date()
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
