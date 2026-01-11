import { memorials } from '../src/data/memorials.js';

function validateHeroes() {
  const errors = [];
  const warnings = [];
  const ids = new Set();

  console.log('🔍 Validating heroes data...\n');

  memorials.forEach((hero, index) => {
    // Check required fields
    if (!hero.id) {
      errors.push(`Hero at index ${index}: Missing id`);
    }
    if (!hero.name) {
      errors.push(`Hero at index ${index}: Missing name`);
    }
    if (!hero.sex) {
      errors.push(`Hero ${hero.name || `at index ${index}`}: Missing sex`);
    }
    if (!hero.died_at) {
      errors.push(`Hero ${hero.name || `at index ${index}`}: Missing died_at`);
    }
    if (!hero.causeOfDeath) {
      errors.push(`Hero ${hero.name || `at index ${index}`}: Missing causeOfDeath`);
    }
    if (!hero.links || hero.links.length === 0) {
      errors.push(`Hero ${hero.name || `at index ${index}`}: Missing links (at least one source required)`);
    }

    // Check duplicate IDs
    if (hero.id) {
      if (ids.has(hero.id)) {
        errors.push(`Duplicate ID found: ${hero.id} (${hero.name})`);
      }
      ids.add(hero.id);
    }

    // Validate ID format (kebab-case)
    if (hero.id && !/^[a-z0-9-]+$/.test(hero.id)) {
      errors.push(`Hero ${hero.name}: Invalid ID format "${hero.id}" (must be lowercase kebab-case)`);
    }

    // Validate sex values
    if (hero.sex && !['male', 'female', 'nb'].includes(hero.sex)) {
      errors.push(`Hero ${hero.name}: Invalid sex value "${hero.sex}" (must be male, female, or nb)`);
    }

    // Validate date format
    if (hero.died_at && !/^\d{4}-\d{2}-\d{2}$/.test(hero.died_at)) {
      warnings.push(`Hero ${hero.name}: died_at should be in YYYY-MM-DD format, got "${hero.died_at}"`);
    }

    // Check optional but recommended fields
    if (!hero.description) {
      warnings.push(`Hero ${hero.name}: Missing description (recommended)`);
    }
    if (!hero.city) {
      warnings.push(`Hero ${hero.name}: Missing city (recommended)`);
    }
    if (!hero.province) {
      warnings.push(`Hero ${hero.name}: Missing province (recommended)`);
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

  console.log('✅ All heroes validated successfully!');
  console.log(`   Total heroes: ${memorials.length}`);
  console.log(`   Unique IDs: ${ids.size}`);
  console.log(`   Warnings: ${warnings.length}\n`);
}

validateHeroes();
