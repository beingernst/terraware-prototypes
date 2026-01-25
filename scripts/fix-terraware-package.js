/**
 * Postinstall script to fix @terraware/web-components package.json
 * The published package has an incorrect main field pointing to dist/index.js
 * but the actual file is at index.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const packagePath = resolve(__dirname, '../node_modules/@terraware/web-components/package.json');

try {
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

  // Fix the main field
  if (packageJson.main === 'dist/index.js') {
    packageJson.main = 'index.js';

    // Add exports field for proper CSS resolution
    packageJson.exports = {
      '.': {
        import: './index.js',
        require: './index.js',
        types: './index.d.ts'
      },
      './index.css': './index.css',
      './theme': {
        import: './theme.js',
        require: './theme.js',
        types: './theme.d.ts'
      }
    };

    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('Fixed @terraware/web-components package.json');
  } else {
    console.log('@terraware/web-components package.json already fixed or has different structure');
  }
} catch (error) {
  console.error('Failed to fix @terraware/web-components:', error.message);
  process.exit(0); // Don't fail the install
}
