import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })
  }
}

// PUT update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, amount, type, categoryId, description, date } = body

    const transaction = await db.transaction.update({
      where: { id: params.id },
      data: {
        title,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        type,
        categoryId,
        description: description !== undefined ? (description || null) : undefined,
        date: date !== undefined ? new Date(date) : undefined
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

// DELETE transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.transaction.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
