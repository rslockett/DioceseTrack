import { Database } from "@replit/database"

export async function POST(request: Request) {
  console.log('POST storage route called')
  
  try {
    const { key, value } = await request.json()
    
    if (!key || value === undefined) {
      return new Response('Key and value are required', { status: 400 })
    }

    console.log('Initializing Replit DB')
    const db = new Database(process.env.REPLIT_DB_URL)
    console.log('DB initialized, setting value for key:', key)
    
    await db.set(key, value)
    console.log('Value set successfully')
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Storage error:', error)
    return new Response(`Storage error: ${error.message}`, { status: 500 })
  }
} 