import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Use Docker service name for internal communication, fallback to environment variable
    const authServiceUrl = process.env.NEXT_PUBLIC_API_AUTH_URL || 'http://auth-service:3000';
    const apiUrl = `${authServiceUrl}/auth/signin`;
    
    console.log('🔐 Signin request to:', apiUrl);
    
    // Forward the request to the Spring Boot backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Signin failed:', data);
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Signin API error:', error);
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}


