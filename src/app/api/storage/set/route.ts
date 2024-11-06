import { Database } from "@replit/database"

export async function POST(request: Request) {
  const { key, value } = await request.json()
  
  if (!key || value === undefined) {
    return new Response('Key and value are required', { status: 400 })
  }

  try {
    const db = new Database()
    await db.set(key, value)
    return new Response('OK', { status: 200 })
  } catch (error) {
    return new Response('Storage error', { status: 500 })
  }
} 