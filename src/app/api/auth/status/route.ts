import { NextResponse } from 'next/server'
import { storage as replitStorage } from '@/lib/storageService'

export async function GET() {
  try {
    const currentUser = await replitStorage.getJSON('currentUser')
    return NextResponse.json({ authenticated: !!currentUser })
  } catch (error) {
    console.error('Auth status error:', error)
    return NextResponse.json({ authenticated: false })
  }
} 