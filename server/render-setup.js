/**
 * Render-specific server setup for handling client-side routing
 */
const path = require('path');
const fs = require('fs');
const express = require('express');

/**
 * Configure Express for Render deployment
 * @param {Object} app - Express app
 */
function setupRenderServer(app) {
  // Determine the client build directory
  const clientBuildPaths = [
    path.resolve(__dirname, '../client/dist'),
    path.resolve(__dirname, '../client/build'),
    '/opt/render/project/src/client/dist',
    '/opt/render/project/src/client/build'
  ];
  
  let clientBuildPath = null;
  
  // Find the first path that exists
  for (const p of clientBuildPaths) {
    if (fs.existsSync(p)) {
      clientBuildPath = p;
      console.log(`Found client build directory at: ${p}`);
      break;
    }
  }
  
  if (!clientBuildPath) {
    console.error('Could not find client build directory. Client-side routing will not work.');
    return;
  }
  
  // Serve static files from the client build directory
  app.use(express.static(clientBuildPath));
  
  // Create a catch-all route handler for client-side routing
  app.get('*', (req, res, next) => {
    // Skip API routes and static files
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    
    console.log(`Handling client-side route: ${req.path}`);
    
    // Send the index.html file
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    
    // If index.html doesn't exist, continue to the next middleware
    next();
  });
}

module.exports = setupRenderServer;
