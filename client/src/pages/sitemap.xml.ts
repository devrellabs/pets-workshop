export const prerender = false;

export async function GET() {
  const baseUrl = 'https://tailspinshelter.com';
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
  ];

  // Fetch dynamic dog pages
  let dogPages: { url: string; priority: string; changefreq: string }[] = [];
  try {
    const apiUrl = `${baseUrl}/api/dogs`;
    const response = await fetch(apiUrl);
    if (response.ok) {
      const dogs = await response.json();
      dogPages = dogs.map((dog: { id: number }) => ({
        url: `/dog/${dog.id}`,
        priority: '0.7',
        changefreq: 'weekly',
      }));
    }
  } catch (error) {
    console.error('Error fetching dogs for sitemap:', error);
  }

  const allPages = [...staticPages, ...dogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
