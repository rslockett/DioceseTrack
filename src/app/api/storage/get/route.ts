export async function GET(request: Request) {
  console.log('GET storage route called')
  console.log('REPLIT_DB_URL:', process.env.REPLIT_DB_URL)
  
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (!key) {
    return new Response('Key is required', { status: 400 })
  }

  try {
    const dbUrl = process.env.REPLIT_DB_URL
    if (!dbUrl) {
      throw new Error('REPLIT_DB_URL not found')
    }

    const response = await fetch(`${dbUrl}/${key}`)
    const value = await response.text()
    
    return Response.json({ value: value || null })
  } catch (error) {
    console.error('Storage error:', error)
    return new Response(`Storage error: ${error.message}`, { status: 500 })
  }
} 