import { NextRequest, NextResponse } from 'next/server';

/**
 * GET endpoint for health check
 * Tests connection to auth service
 */
export async function GET(request: NextRequest) {
  try {
    // Try Docker service name first (for internal communication), then fallback to external URL
    // Note: In Next.js API routes, we can use server-side env vars
    const internalUrl = process.env.NEXT_PUBLIC_API_AUTH_URL || 'http://auth-service:3000';
    const externalUrl = process.env.EXTERNAL_AUTH_URL || 'http://51.178.142.95:3000';
    
    console.log('🔍 Auth health check - Internal URL:', internalUrl);
    console.log('🔍 Auth health check - External URL:', externalUrl);
    
    const urlsToTry = [
      { url: `${internalUrl}/auth`, name: 'internal (Docker service)' },
      { url: `${externalUrl}/auth`, name: 'external (public IP)' }
    ];
    
    let lastError: Error | null = null;
    
    for (const { url, name } of urlsToTry) {
      try {
        console.log(`🔍 Health check via ${name}: ${url}`);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout (increased for debugging)
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error(`❌ Health check failed via ${name}:`, data);
          return NextResponse.json(data, { status: response.status });
        }
        
        console.log(`✅ Health check successful via ${name}`);
        return NextResponse.json(data, { status: response.status });
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`❌ Failed to connect via ${name}:`, lastError.message);
        // Continue to next URL
        continue;
      }
    }
    
    // If all URLs failed
    console.error('❌ All connection attempts failed. Last error:', lastError);
    return NextResponse.json(
      { 
        success: false, 
        message: `Cannot connect to auth service. Last error: ${lastError?.message || 'Unknown error'}` 
      },
      { status: 503 } // Service Unavailable
    );
    
  } catch (error) {
    console.error('❌ Health check API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}

