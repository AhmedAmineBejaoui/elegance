import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

// Run after build:client. These exact files previously returned the SPA HTML.
const assets = [
  'images/hero-banner.jpg', 'images/Elegance.jpg',
  'images/categories/robes.jpg', 'images/categories/accessoires.jpg',
  'images/categories/chaussures.jpg', 'images/product-placeholder.svg',
];
for (const path of assets) {
  await access(resolve('dist/public', path));
  const bytes = await readFile(resolve('dist/public', path));
  assert(bytes.length > 100, `${path} must contain an image`);
  assert(!bytes.toString('utf8', 0, 100).includes('<!DOCTYPE html>'), `${path} returned HTML`);
}
const { routes } = JSON.parse(await readFile('vercel.json', 'utf8'));
const filesystem = routes.findIndex(route => route.handle === 'filesystem');
const fallback = routes.findIndex(route => route.dest === '/index.html');
assert(filesystem >= 0 && filesystem < fallback, 'Serve existing files before the SPA fallback');
assert(routes.findIndex(route => route.src === '/api/(.*)') < filesystem, 'Preserve API routing');
console.log(`Verified ${assets.length} built image assets and Vercel route precedence.`);
