import { memorials } from '../src/data/memorials.js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://azadi-road.com';

// Get unique years from memorials
const years = [...new Set(memorials.map(hero => {
  const date = new Date(hero.died_at);
  return date.getFullYear();
}))].sort((a, b) => b - a);

// Generate sitemap XML
const generateSitemap = () => {
  const today = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // Add year pages
  years.forEach(year => {
    sitemap += `  <url>
    <loc>${SITE_URL}/year/${year}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Add memorial pages
  memorials.forEach(hero => {
    sitemap += `  <url>
    <loc>${SITE_URL}/memorial/${hero.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  return sitemap;
};

// Write sitemap to public directory
const sitemap = generateSitemap();
const outputPath = join(__dirname, '../public/sitemap.xml');

try {
  writeFileSync(outputPath, sitemap, 'utf8');
  console.log('✅ Sitemap generated successfully!');
  console.log(`📍 Location: ${outputPath}`);
  console.log(`📊 Stats: ${years.length} years, ${memorials.length} memorials`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
