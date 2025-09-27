const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy all files from public to dist
const publicDir = path.join(__dirname, 'public');
const publicFiles = fs.readdirSync(publicDir);

publicFiles.forEach(file => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(distDir, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
        // Copy directory recursively
        copyDir(srcPath, destPath);
    } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
    }
});

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

console.log('✅ Static build completed successfully!');
console.log('📁 Files copied to dist/ directory');
console.log('🚀 Ready for deployment!');
