import { Database } from "@replit/database"

export async function GET(request: Request) {
  console.log('GET storage route called')
  
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (!key) {
    return new Response('Key is required', { status: 400 })
  }

  try {
    console.log('Initializing Replit DB')
    const db = new Database(process.env.REPLIT_DB_URL)
    console.log('DB initialized, getting value for key:', key)
    
    const value = await db.get(key)
    console.log('Value retrieved:', value)
    
    return Response.json({ value })
  } catch (error) {
    console.error('Storage error:', error)
    return new Response(`Storage error: ${error.message}`, { status: 500 })
  }
} 