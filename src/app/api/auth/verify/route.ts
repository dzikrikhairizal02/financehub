import { NextRequest, NextResponse } from 'next/server'

// POST - Verify PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin } = body

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      )
    }

    // Get stored PIN from request (sent from client)
    const { storedPin } = body

    if (!storedPin) {
      return NextResponse.json(
        { error: 'No PIN found. Please setup PIN first.' },
        { status: 400 }
      )
    }

    // Verify PIN
    if (pin === storedPin) {
      return NextResponse.json({ 
        success: true, 
        message: 'PIN verified successfully' 
      })
    }

    return NextResponse.json(
      { error: 'Invalid PIN' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Error verifying PIN:', error)
    return NextResponse.json({ error: 'Failed to verify PIN' }, { status: 500 })
  }
}
