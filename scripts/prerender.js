import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { memorials } from '../src/data/memorials.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');
const BASE_URL = 'http://localhost:4173'; // Vite preview server

// Get unique years
const years = [...new Set(memorials.map(hero => {
  const date = new Date(hero.died_at);
  return date.getFullYear();
}))].sort((a, b) => b - a);

// Generate all routes
const routes = [
  '/',
  ...years.map(year => `/year/${year}`),
  ...memorials.map(hero => `/memorial/${hero.id}`)
];

// Batch size for concurrent rendering
const BATCH_SIZE = 10; // Render 10 pages concurrently

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  
  try {
    const url = `${BASE_URL}${route}`;
    
    // Navigate and wait for network to be idle
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for React to update meta tags (reduced from 1000ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the fully rendered HTML
    const html = await page.content();
    
    // Determine output path
    let outputPath;
    if (route === '/') {
      outputPath = join(DIST_DIR, 'index.html');
    } else {
      const routePath = join(DIST_DIR, route);
      mkdirSync(routePath, { recursive: true });
      outputPath = join(routePath, 'index.html');
    }
    
    // Write HTML file
    writeFileSync(outputPath, html, 'utf8');
    console.log(`✓ ${route}`);
    
  } catch (error) {
    console.error(`✗ ${route}: ${error.message}`);
  } finally {
    await page.close();
  }
}

// Process routes in batches for concurrent rendering
async function processBatch(browser, routes) {
  const promises = routes.map(route => prerenderRoute(browser, route));
  await Promise.all(promises);
}

async function prerender() {
  const startTime = Date.now();
  console.log('🚀 Starting pre-rendering...');
  console.log(`📊 Routes to generate: ${routes.length}`);
  console.log(`⚡ Concurrent pages: ${BATCH_SIZE}\n`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Split routes into batches
    for (let i = 0; i < routes.length; i += BATCH_SIZE) {
      const batch = routes.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(routes.length / BATCH_SIZE);
      
      console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} pages):`);
      await processBatch(browser, batch);
      console.log('');
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const pagesPerSecond = (routes.length / (duration)).toFixed(2);
    
    console.log('✅ Pre-rendering complete!');
    console.log(`📁 Generated ${routes.length} static HTML files`);
    console.log(`⏱️  Total time: ${duration}s (${pagesPerSecond} pages/sec)`);
    
  } catch (error) {
    console.error('❌ Pre-rendering failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

prerender();
