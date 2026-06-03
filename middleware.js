// middleware.js
export const config = {
  matcher: [
    // Apply to all routes except static assets (images, fonts, etc.)
    '/((?!_next/static|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|css|js|woff2?)).*)',
  ],
};

export default async function middleware(request) {
  const { headers, nextUrl } = request;
  const userAgent = headers.get('user-agent') || '';
  
  // Check if the request comes from a crawler
  const isCrawler = /bot|googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|facebot|twitterbot|chatgpt|anthropic|perplexity|claudebot/i.test(userAgent);
  
  if (!isCrawler) {
    // Normal user – proceed normally
    return;
  }
  
  // For crawlers, fetch pre‑rendered version from Prerender.io
  const prerenderToken = process.env.PRERENDER_TOKEN;
  if (!prerenderToken) {
    console.warn('Missing PRERENDER_TOKEN – skipping prerender');
    return;
  }
  
  const url = `https://service.prerender.io/${nextUrl.href}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-Prerender-Token': prerenderToken,
        'User-Agent': userAgent, // forward original UA
      },
    });
    
    if (response.ok) {
      // Return the pre‑rendered HTML
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        },
      });
    }
  } catch (error) {
    console.error('Prerender fetch failed:', error);
  }
  
  // Fallback: let Vercel serve the original React app
  return;
}