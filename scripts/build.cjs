#!/usr/bin/env node
/**
 * Build script for Nudge Chrome Extension
 * Uses esbuild for all bundling
 */

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

async function build() {
  console.log(`\nBuilding Nudge Chrome Extension (${isProduction ? 'production' : 'development'})...\n`);

  const startTime = Date.now();
  const distDir = path.resolve(__dirname, '../dist');
  const publicDir = path.resolve(__dirname, '../public');
  const srcDir = path.resolve(__dirname, '../src');

  // Clean and create dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(path.join(distDir, 'src'), { recursive: true });

  // 1. Copy manifest.json
  console.log('Copying manifest.json...');
  fs.copyFileSync(
    path.join(publicDir, 'manifest.json'),
    path.join(distDir, 'manifest.json')
  );

  // 2. Copy icons
  console.log('Copying icons...');
  const iconsDir = path.join(publicDir, 'icons');
  const distIconsDir = path.join(distDir, 'icons');
  fs.mkdirSync(distIconsDir, { recursive: true });
  fs.readdirSync(iconsDir).forEach(file => {
    fs.copyFileSync(path.join(iconsDir, file), path.join(distIconsDir, file));
  });

  // 3. Copy options.html
  console.log('Copying options.html...');
  fs.copyFileSync(
    path.join(srcDir, 'options.html'),
    path.join(distDir, 'src/options.html')
  );

  // 4. Build options script
  console.log('Building options.js...');
  await esbuild.build({
    entryPoints: [path.join(srcDir, 'options.ts')],
    bundle: true,
    outfile: path.join(distDir, 'src/options.js'),
    format: 'esm',
    target: 'es2020',
    minify: isProduction,
    sourcemap: !isProduction,
    legalComments: 'none',
    drop: isProduction ? ['console', 'debugger'] : [],
  });

  // Update options.html to reference the built JS file
  let optionsHtml = fs.readFileSync(path.join(distDir, 'src/options.html'), 'utf8');
  optionsHtml = optionsHtml.replace('./options.ts', './options.js');
  fs.writeFileSync(path.join(distDir, 'src/options.html'), optionsHtml);

  // 5. Build content script
  console.log('Building content.js...');
  await esbuild.build({
    entryPoints: [path.join(srcDir, 'content.ts')],
    bundle: true,
    outfile: path.join(distDir, 'content.js'),
    format: 'iife',
    target: 'es2020',
    minify: isProduction,
    sourcemap: !isProduction,
    legalComments: 'none',
    drop: isProduction ? ['console', 'debugger'] : [],
  });

  // 6. Build background script
  console.log('Building background.js...');
  await esbuild.build({
    entryPoints: [path.join(srcDir, 'background.ts')],
    bundle: true,
    outfile: path.join(distDir, 'background.js'),
    format: 'iife',
    target: 'es2020',
    minify: isProduction,
    sourcemap: !isProduction,
    legalComments: 'none',
    drop: isProduction ? ['console', 'debugger'] : [],
  });

  // 7. Report build sizes
  const files = ['background.js', 'content.js', 'src/options.js'];

  console.log('\nBundle sizes:');
  let totalSize = 0;

  files.forEach((file) => {
    const filePath = path.join(distDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      totalSize += stats.size;
      console.log(`  ${file.padEnd(20)} ${sizeKB} KB`);
    }
  });

  console.log(`  ${'Total'.padEnd(20)} ${(totalSize / 1024).toFixed(2)} KB`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✓ Build complete in ${elapsed}s`);
  console.log('Load the dist/ folder in chrome://extensions\n');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
