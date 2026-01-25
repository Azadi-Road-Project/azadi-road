import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/memorials');

// Function to extract domain name for label
function getDomainLabel(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Map common domains to readable labels
    const domainMap = {
      'en.wikipedia.org': 'Wikipedia',
      'fa.wikipedia.org': 'Wikipedia (FA)',
      'www.wikipedia.org': 'Wikipedia',
      'iranhr.net': 'Iran Human Rights',
      'www.iranhr.net': 'Iran Human Rights',
      'iranintl.com': 'Iran International',
      'www.iranintl.com': 'Iran International',
      'www.bbc.com': 'BBC',
      'bbc.com': 'BBC',
      'twitter.com': 'Twitter',
      'x.com': 'Twitter/X',
      'instagram.com': 'Instagram',
      'www.instagram.com': 'Instagram',
      'amnesty.org': 'Amnesty International',
      'www.amnesty.org': 'Amnesty International',
      'hrw.org': 'Human Rights Watch',
      'www.hrw.org': 'Human Rights Watch',
    };
    
    return domainMap[hostname] || hostname.replace('www.', '');
  } catch (e) {
    return 'Source';
  }
}

// Function to process a markdown file
function processMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if file has links field
  if (!content.includes('links:')) {
    return false;
  }
  
  // Split into frontmatter and body
  const parts = content.split('---');
  if (parts.length < 3) {
    return false;
  }
  
  const frontmatter = parts[1];
  const body = parts.slice(2).join('---');
  
  // Check if links are already in object format (with url/label)
  if (frontmatter.includes('url:') && frontmatter.includes('label:')) {
    console.log(`Skipping ${path.basename(filePath)} - already has labels`);
    return false;
  }
  
  // Parse links section
  const lines = frontmatter.split('\n');
  const newLines = [];
  let inLinks = false;
  let hasChanges = false;
  let linkCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim() === 'links:') {
      inLinks = true;
      newLines.push(line);
      continue;
    }
    
    if (inLinks) {
      // Check if this is a link line (starts with - http)
      const linkMatch = line.match(/^\s*-\s+(https?:\/\/.+)$/);
      if (linkMatch) {
        const url = linkMatch[1].trim();
        const label = getDomainLabel(url);
        linkCount++;
        
        // Convert to object format
        const indent = '  ';
        newLines.push(`${indent}- url: ${url}`);
        newLines.push(`${indent}  label: "${label}"`);
        hasChanges = true;
      } else if (line.trim().startsWith('-') || line.includes(':')) {
        // End of links section
        inLinks = false;
        newLines.push(line);
      } else if (line.trim() === '') {
        newLines.push(line);
      } else {
        inLinks = false;
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  
  if (hasChanges) {
    const newContent = `---${newLines.join('\n')}---${body}`;
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✓ Updated ${path.basename(filePath)} - ${linkCount} link(s) labeled`);
    return true;
  }
  
  return false;
}

// Function to recursively process all markdown files
function processDirectory(dir) {
  let totalUpdated = 0;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      totalUpdated += processDirectory(fullPath);
    } else if (item.endsWith('.md')) {
      if (processMarkdownFile(fullPath)) {
        totalUpdated++;
      }
    }
  }
  
  return totalUpdated;
}

// Main execution
console.log('Starting to add labels to links...\n');
const updated = processDirectory(contentDir);
console.log(`\n✓ Completed! Updated ${updated} file(s).`);
