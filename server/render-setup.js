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
    '/opt/render/project/src/client/build',
    // Add more possible paths
    '/opt/render/project/client/dist',
    '/opt/render/project/client/build'
  ];

  // Log the current directory and possible paths for debugging
  console.log('Current directory:', __dirname);
  console.log('Looking for client build directory in:', clientBuildPaths);

  let clientBuildPath = null;

  // Find the first path that exists
  for (const p of clientBuildPaths) {
    if (fs.existsSync(p)) {
      clientBuildPath = p;
      console.log(`Found client build directory at: ${p}`);

      // List the contents of the directory for debugging
      try {
        const files = fs.readdirSync(p);
        console.log(`Contents of ${p}:`, files);

        // Check if index.html exists
        const indexPath = path.join(p, 'index.html');
        if (fs.existsSync(indexPath)) {
          console.log(`index.html found at: ${indexPath}`);
        } else {
          console.log(`index.html NOT found at: ${indexPath}`);
        }
      } catch (err) {
        console.error(`Error reading directory ${p}:`, err);
      }

      break;
    }
  }

  if (!clientBuildPath) {
    console.error('Could not find client build directory. Trying fallback to server public directory.');

    // Try to use the server's public directory as a fallback
    const publicPath = path.join(__dirname, 'public');
    if (fs.existsSync(publicPath)) {
      console.log(`Using fallback public directory: ${publicPath}`);
      app.use(express.static(publicPath));

      // Note: We're not adding a catch-all route handler here anymore.
      // The catch-all route handler is now defined in server/index.js
      console.log('Client-side routing will be handled by the catch-all route in server/index.js');

      return;
    }

    console.error('Could not find any static files directory. Client-side routing will not work.');
    return;
  }

  // Serve static files from the client build directory
  app.use(express.static(clientBuildPath));

  // Note: We're not adding a catch-all route handler here anymore.
  // The catch-all route handler is now defined in server/index.js
  console.log('Client-side routing will be handled by the catch-all route in server/index.js');
}

module.exports = setupRenderServer;
