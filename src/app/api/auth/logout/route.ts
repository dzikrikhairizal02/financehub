import { NextRequest, NextResponse } from 'next/server'

// POST - Logout
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
