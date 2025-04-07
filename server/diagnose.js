const fs = require('fs');
const path = require('path');

console.log('=== ENVIRONMENT DIAGNOSTICS ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Current directory: ${process.cwd()}`);
console.log(`__dirname: ${__dirname}`);

// Check for client build directories
const possiblePaths = [
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, '../client/build'),
  '/opt/render/project/src/client/dist',
  '/opt/render/project/src/client/build'
];

console.log('\n=== CHECKING FOR CLIENT BUILD DIRECTORIES ===');
possiblePaths.forEach(p => {
  const exists = fs.existsSync(p);
  console.log(`${p}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
  
  if (exists) {
    // Check for index.html
    const indexPath = path.join(p, 'index.html');
    const indexExists = fs.existsSync(indexPath);
    console.log(`  - index.html: ${indexExists ? 'EXISTS' : 'NOT FOUND'}`);
    
    // List directory contents
    console.log('  - Directory contents:');
    try {
      const files = fs.readdirSync(p);
      files.forEach(file => {
        const stats = fs.statSync(path.join(p, file));
        console.log(`    - ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
      });
    } catch (err) {
      console.log(`    Error reading directory: ${err.message}`);
    }
  }
});

console.log('\n=== SERVER ROUTES ===');
// This will be populated by the server when it imports this file
global.printRoutes = (app) => {
  const routes = [];
  
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase()
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            method: Object.keys(handler.route.methods)[0].toUpperCase()
          });
        }
      });
    }
  });
  
  routes.sort((a, b) => a.path.localeCompare(b.path));
  
  console.log('Registered routes:');
  routes.forEach(route => {
    console.log(`  ${route.method} ${route.path}`);
  });
};

module.exports = { printRoutes: global.printRoutes };
