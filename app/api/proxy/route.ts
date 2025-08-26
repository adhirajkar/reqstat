import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, method = 'GET', headers = {}, body } = await request.json();

    let normalizedUrl: string;
    try {
      const urlObj = new URL(url);
      normalizedUrl = urlObj.toString();
    } catch {
      try {
        const urlObj = new URL(`https://${url}`);
        normalizedUrl = urlObj.toString();
      } catch {
        return NextResponse.json({
          error: `Invalid URL: ${url}. Please provide a complete URL (e.g., https://example.com)`,
          status: 400,
          statusText: 'Bad Request',
          success: false,
        }, { status: 400 });
      }
    }

    const response = await fetch(normalizedUrl, {
      method,
      headers: {
        ...headers,
        'User-Agent': 'Req-Stat/1.0',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.text();
    const responseHeaders = Object.fromEntries(response.headers.entries());
    const cookies = parseCookies(response.headers.get('set-cookie'));

    return NextResponse.json({
      data: tryParseJSON(data),
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      cookies,
      success: response.ok,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    let errorMessage = 'Failed to fetch';
    let statusCode = 500;
    
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      const cause = (error as Error & { cause?: { code?: string; hostname?: string } }).cause;
      if (cause?.code === 'ENOTFOUND') {
        errorMessage = `Domain not found: ${cause.hostname}. Please check the URL is correct.`;
        statusCode = 404;
      } else if (cause?.code === 'ECONNREFUSED') {
        errorMessage = `Connection refused. The server might be down or the port is incorrect.`;
        statusCode = 503;
      } else if (cause?.code === 'ETIMEDOUT') {
        errorMessage = `Request timed out. The server is taking too long to respond.`;
        statusCode = 408;
      }
    }
    
    return NextResponse.json({
      error: errorMessage,
      status: 0,
      statusText: 'Network Error',
      success: false,
      details: error instanceof Error ? error.message : String(error),
    }, { status: statusCode });
  }
}

function tryParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function parseCookies(setCookieHeader: string | null): Record<string, string> {
  if (!setCookieHeader) return {};
  
  const cookies: Record<string, string> = {};
  
  const cookieStrings = setCookieHeader.includes(',') 
    ? setCookieHeader.split(/,(?=\s*\w+=)/) 
    : [setCookieHeader];
  
  cookieStrings.forEach(cookieString => {
    const [nameValue] = cookieString.trim().split(';');
    if (nameValue) {
      const [name, value] = nameValue.split('=').map(s => s.trim());
      if (name && value !== undefined) {
        cookies[name] = value;
      }
    }
  });
  
  return cookies;
}