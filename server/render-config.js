/**
 * Special configuration for Render deployment
 */
const path = require('path');
const express = require('express');
const fs = require('fs');

/**
 * Configure Express for Render deployment
 * @param {Object} app - Express app
 */
function configureForRender(app) {
  console.log('Configuring Express for Render deployment');
  
  // Determine the client build directory
  let clientBuildPath = null;
  
  // Check possible build directories
  const possiblePaths = [
    path.join(__dirname, '../client/dist'),
    path.join(__dirname, '../client/build'),
    '/opt/render/project/src/client/dist',
    '/opt/render/project/src/client/build'
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      clientBuildPath = p;
      console.log(`Found client build directory: ${clientBuildPath}`);
      break;
    }
  }
  
  if (!clientBuildPath) {
    console.log('Client build directory not found. Using fallback.');
    return;
  }
  
  // Serve static files from the client build directory
  app.use(express.static(clientBuildPath));
  
  // Create a simple catch-all route handler
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    
    console.log(`Handling client-side route: ${req.path}`);
    
    // Send the index.html file
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      console.log(`Index.html not found at ${indexPath}`);
      return next();
    }
  });
}

module.exports = configureForRender;
