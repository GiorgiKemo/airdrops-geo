/**
 * Server configuration for handling client-side routing with React Router
 */

const path = require('path');
const fs = require('fs');
const express = require('express');

/**
 * Configure the Express app to handle client-side routing
 * @param {Object} app - Express app instance
 */
function configureServer(app) {
  // Determine the environment
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`Configuring server for ${isProduction ? 'production' : 'development'} environment`);
  
  if (isProduction) {
    // Find the client build directory
    let clientBuildPath = null;
    const possiblePaths = [
      path.resolve(__dirname, '../client/dist'),
      path.resolve(__dirname, '../client/build'),
      '/opt/render/project/src/client/dist',
      '/opt/render/project/src/client/build'
    ];
    
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        clientBuildPath = p;
        console.log(`Found client build directory at: ${clientBuildPath}`);
        break;
      }
    }
    
    if (clientBuildPath) {
      // Serve static files from the client build directory
      app.use(express.static(clientBuildPath));
      
      // Always serve index.html for any request that doesn't match an API route or static file
      app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
          return next();
        }
        
        const indexPath = path.join(clientBuildPath, 'index.html');
        console.log(`Serving index.html for client-side route: ${req.path}`);
        res.sendFile(indexPath);
      });
    } else {
      console.log('Client build directory not found. Serving fallback HTML.');
      
      // Serve the fallback HTML file
      const fallbackPath = path.join(__dirname, 'public');
      app.use(express.static(fallbackPath));
      
      app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
          return next();
        }
        
        const fallbackIndexPath = path.join(fallbackPath, 'index.html');
        if (fs.existsSync(fallbackIndexPath)) {
          console.log(`Serving fallback index.html for client-side route: ${req.path}`);
          res.sendFile(fallbackIndexPath);
        } else {
          console.log(`Fallback index.html not found. Sending 404 for: ${req.path}`);
          res.status(404).send('Client application not found');
        }
      });
    }
  }
}

module.exports = configureServer;
