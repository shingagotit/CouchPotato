const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting static deployment...');

// First, run our custom static build
console.log('📦 Building static files...');
execSync('node build-static.cjs', { stdio: 'inherit' });

// Then deploy using gh-pages
console.log('🌐 Deploying to GitHub Pages...');
execSync('npx gh-pages -d dist', { stdio: 'inherit' });

console.log('✅ Static deployment completed successfully!');
console.log('🎉 Your site should now be working at: https://shingagotit.github.io/CouchPotato/');
