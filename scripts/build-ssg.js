import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '../dist');

// Check if dist exists
if (!existsSync(DIST_DIR)) {
  console.error('❌ dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('🚀 Starting preview server and pre-rendering...\n');

// Start preview server (use cmd /c for Windows compatibility)
const previewServer = spawn('cmd', ['/c', 'npm', 'run', 'preview'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true
});

let serverReady = false;

previewServer.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  // Wait for server to be ready
  if ((output.includes('Local:') || output.includes('localhost')) && !serverReady) {
    serverReady = true;
    console.log('\n✓ Preview server ready!\n');
    
    // Wait a bit then start pre-rendering
    setTimeout(() => {
      console.log('Starting pre-rendering process...\n');
      
      const prerender = spawn('node', ['scripts/prerender.js'], {
        stdio: 'inherit',
        shell: true
      });
      
      prerender.on('close', (code) => {
        console.log(`\n✓ Pre-rendering finished with code ${code}`);
        // Kill preview server
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', previewServer.pid, '/f', '/t']);
        } else {
          previewServer.kill();
        }
        process.exit(code);
      });
      
      prerender.on('error', (err) => {
        console.error('Error running prerender script:', err);
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', previewServer.pid, '/f', '/t']);
        } else {
          previewServer.kill();
        }
        process.exit(1);
      });
    }, 3000); // Increased wait time
  }
});

previewServer.stderr.on('data', (data) => {
  process.stderr.write(data);
});

previewServer.on('error', (err) => {
  console.error('Error starting preview server:', err);
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n⚠️  Stopping preview server...');
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', previewServer.pid, '/f', '/t']);
  } else {
    previewServer.kill();
  }
  process.exit(0);
});
