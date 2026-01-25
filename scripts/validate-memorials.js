import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all markdown files
function loadMemorials() {
  const contentDir = path.join(__dirname, '..', 'content', 'memorials');
  const memorials = [];
  const years = ['2009', '2022', '2025', '2026'];

  years.forEach(year => {
    const yearDir = path.join(contentDir, year);
    if (!fs.existsSync(yearDir)) return;

    const files = fs.readdirSync(yearDir);
    files.forEach(file => {
      if (!file.endsWith('.md')) return;

      const content = fs.readFileSync(path.join(yearDir, file), 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (!frontmatterMatch) return;

      const frontmatter = {};
      const lines = frontmatterMatch[1].split('\n');
      let currentKey = null;
      let currentArray = null;

      lines.forEach(line => {
        if (line.trim().startsWith('-') && currentArray) {
          currentArray.push(line.trim().substring(1).trim());
        } else if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim().replace(/^"|"$/g, '');
          currentKey = key.trim();
          
          if (value === '') {
            currentArray = [];
            frontmatter[currentKey] = currentArray;
          } else if (value === 'true') {
            frontmatter[currentKey] = true;
          } else if (value === 'false') {
            frontmatter[currentKey] = false;
          } else {
            frontmatter[currentKey] = value;
          }
        }
      });

      memorials.push(frontmatter);
    });
  });

  return memorials;
}

function validateMemorials() {
  const memorials = loadMemorials();
  const errors = [];
  const warnings = [];
  const ids = new Set();

  console.log('🔍 Validating memorials data...\n');

  memorials.forEach((memorial, index) => {
    // Check required fields
    if (!memorial.id) {
      errors.push(`Memorial at index ${index}: Missing id`);
    }
    if (!memorial.name) {
      errors.push(`Memorial at index ${index}: Missing name`);
    }
    if (!memorial.sex) {
      errors.push(`Memorial ${memorial.name || `at index ${index}`}: Missing sex`);
    }
    if (!memorial.died_at) {
      errors.push(`Memorial ${memorial.name || `at index ${index}`}: Missing died_at`);
    }
    if (!memorial.causeOfDeath) {
      errors.push(`Memorial ${memorial.name || `at index ${index}`}: Missing causeOfDeath`);
    }
    if (!memorial.links || memorial.links.length === 0) {
      errors.push(`Memorial ${memorial.name || `at index ${index}`}: Missing links (at least one source required)`);
    }

    // Check duplicate IDs
    if (memorial.id) {
      if (ids.has(memorial.id)) {
        errors.push(`Duplicate ID found: ${memorial.id} (${memorial.name})`);
      }
      ids.add(memorial.id);
    }

    // Validate ID format (kebab-case)
    if (memorial.id && !/^[a-z0-9-]+$/.test(memorial.id)) {
      errors.push(`Memorial ${memorial.name}: Invalid ID format "${memorial.id}" (must be lowercase kebab-case)`);
    }

    // Validate sex values
    if (memorial.sex && !['male', 'female', 'nb'].includes(memorial.sex)) {
      errors.push(`Memorial ${memorial.name}: Invalid sex value "${memorial.sex}" (must be male, female, or nb)`);
    }

    // Validate date format
    if (memorial.died_at && !/^\d{4}-\d{2}-\d{2}$/.test(memorial.died_at)) {
      warnings.push(`Memorial ${memorial.name}: died_at should be in YYYY-MM-DD format, got "${memorial.died_at}"`);
    }

    // Check optional but recommended fields
    if (!memorial.description) {
      warnings.push(`Memorial ${memorial.name}: Missing description (recommended)`);
    }
    if (!memorial.city) {
      warnings.push(`Memorial ${memorial.name}: Missing city (recommended)`);
    }
    if (!memorial.province) {
      warnings.push(`Memorial ${memorial.name}: Missing province (recommended)`);
    }
  });

  // Display results
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.error('❌ Validation failed with errors:\n');
    errors.forEach(err => console.error(`   ${err}`));
    console.log('');
    process.exit(1);
  }

  console.log('✅ All memorials validated successfully!');
  console.log(`   Total memorials: ${memorials.length}`);
  console.log(`   Unique IDs: ${ids.size}`);
  console.log(`   Warnings: ${warnings.length}\n`);
}

validateMemorials();
