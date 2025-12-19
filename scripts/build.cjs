#!/usr/bin/env node
/**
 * Build script for Nudge Chrome Extension
 * Builds content.js and background.js as IIFE bundles (no ES module imports)
 * Builds options page with Vite
 */

const { execSync } = require('child_process');
const esbuild = require('esbuild');
const path = require('path');

async function build() {
  console.log('Building Nudge Chrome Extension...\n');

  // 1. Build options page with Vite (supports ES modules)
  console.log('📦 Building options page...');
  execSync('npx vite build', { stdio: 'inherit' });

  // 2. Build content script as IIFE (no imports allowed in content scripts)
  console.log('\n📦 Building content script...');
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../src/content.ts')],
    bundle: true,
    outfile: path.resolve(__dirname, '../dist/content.js'),
    format: 'iife',
    target: 'es2020',
    minify: false,
  });

  // 3. Build background script as IIFE
  // Note: MV3 service workers support ES modules, but IIFE is simpler
  console.log('📦 Building background script...');
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../src/background.ts')],
    bundle: true,
    outfile: path.resolve(__dirname, '../dist/background.js'),
    format: 'iife',
    target: 'es2020',
    minify: false,
  });

  console.log('\n✅ Build complete! Load the dist/ folder in Chrome.');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
