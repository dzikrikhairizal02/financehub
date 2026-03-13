import { NextRequest, NextResponse } from 'next/server'

// GET - Check PIN setup status
export async function GET(request: NextRequest) {
  try {
    // The client will send the stored PIN as a query parameter
    const { searchParams } = new URL(request.url)
    const hasPin = searchParams.get('hasPin')

    const isSetup = hasPin === 'true'

    return NextResponse.json({ 
      isSetup,
      message: isSetup ? 'PIN is already setup' : 'PIN not setup yet'
    })
  } catch (error) {
    console.error('Error checking PIN status:', error)
    return NextResponse.json({ error: 'Failed to check PIN status' }, { status: 500 })
  }
}
