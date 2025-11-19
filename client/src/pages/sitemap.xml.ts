export const prerender = false;

export async function GET() {
  const siteUrl = import.meta.env.SITE || 'https://tailspinshelter.com';
  const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:5100';
  
  // Fetch all dogs for dynamic URLs
  let dogs: Array<{ id: number }> = [];
  try {
    const response = await fetch(`${apiUrl}/api/dogs`);
    if (response.ok) {
      dogs = await response.json();
    }
  } catch (error) {
    console.error('Error fetching dogs for sitemap:', error);
  }
  
  // Static pages
  const staticPages = [
    {
      url: `${siteUrl}/`,
      changefreq: 'daily',
      priority: '1.0',
      lastmod: new Date().toISOString()
    },
    {
      url: `${siteUrl}/about`,
      changefreq: 'monthly',
      priority: '0.8',
      lastmod: new Date().toISOString()
    }
  ];
  
  // Dynamic dog pages
  const dogPages = dogs.map(dog => ({
    url: `${siteUrl}/dog/${dog.id}`,
    changefreq: 'weekly',
    priority: '0.9',
    lastmod: new Date().toISOString()
  }));
  
  const allPages = [...staticPages, ...dogPages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'max-age=3600'
    }
  });
}
