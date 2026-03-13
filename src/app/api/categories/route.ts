import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, color, icon } = body

    if (!name || !type || !color) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, color' },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        type,
        color,
        icon: icon || null
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
