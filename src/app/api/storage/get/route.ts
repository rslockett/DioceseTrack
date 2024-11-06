import { Database } from "@replit/database"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (!key) {
    return new Response('Key is required', { status: 400 })
  }

  try {
    const db = new Database()
    const value = await db.get(key)
    return Response.json({ value })
  } catch (error) {
    return new Response('Storage error', { status: 500 })
  }
} 