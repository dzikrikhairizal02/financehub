import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await db.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, type, color, icon } = body

    // Check if category exists
    const existing = await db.category.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const category = await db.category.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        type: type !== undefined ? type : existing.type,
        color: color !== undefined ? color : existing.color,
        icon: icon !== undefined ? (icon || null) : existing.icon
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has transactions
    const categoryWithTransactions = await db.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    })

    if (!categoryWithTransactions) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (categoryWithTransactions._count.transactions > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with existing transactions',
          transactionCount: categoryWithTransactions._count.transactions
        },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
