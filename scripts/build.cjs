#!/usr/bin/env node
/**
 * Build script for Nudge Chrome Extension
 * Production build with minification
 */

const { execSync } = require('child_process');
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

async function build() {
  console.log(`\nBuilding Nudge Chrome Extension (${isProduction ? 'production' : 'development'})...\n`);

  const startTime = Date.now();

  // 1. Build options page with Vite
  console.log('Building options page...');
  execSync('npx vite build', { stdio: 'inherit' });

  // 2. Build content script
  console.log('\nBuilding content script...');
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../src/content.ts')],
    bundle: true,
    outfile: path.resolve(__dirname, '../dist/content.js'),
    format: 'iife',
    target: 'es2020',
    minify: isProduction,
    sourcemap: !isProduction,
    legalComments: 'none',
    drop: isProduction ? ['console', 'debugger'] : [],
  });

  // 3. Build background script
  console.log('Building background script...');
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../src/background.ts')],
    bundle: true,
    outfile: path.resolve(__dirname, '../dist/background.js'),
    format: 'iife',
    target: 'es2020',
    minify: isProduction,
    sourcemap: !isProduction,
    legalComments: 'none',
    drop: isProduction ? ['console', 'debugger'] : [],
  });

  // 4. Report build sizes
  const distDir = path.resolve(__dirname, '../dist');
  const files = ['background.js', 'content.js', 'options.js'];

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
  console.log(`\nBuild complete in ${elapsed}s`);
  console.log('Load the dist/ folder in chrome://extensions\n');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
