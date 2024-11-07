export async function POST(request: Request) {
  console.log('POST storage route called')
  console.log('REPLIT_DB_URL:', process.env.REPLIT_DB_URL)
  
  try {
    const { key, value } = await request.json()
    
    if (!key || value === undefined) {
      return new Response('Key and value are required', { status: 400 })
    }

    const dbUrl = process.env.REPLIT_DB_URL
    if (!dbUrl) {
      throw new Error('REPLIT_DB_URL not found')
    }

    const response = await fetch(dbUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `${key}=${encodeURIComponent(JSON.stringify(value))}`,
    })

    if (!response.ok) {
      throw new Error(`Failed to set value: ${response.statusText}`)
    }
    
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Storage error:', error)
    return new Response(`Storage error: ${error.message}`, { status: 500 })
  }
} 