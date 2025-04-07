#!/bin/bash

# Exit on error
set -e

echo "Starting Render build process..."

# Print environment information
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install

# Build client
echo "Building client..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
  echo "Client build successful!"
  ls -la dist
else
  echo "Client build failed! dist directory not found."
  exit 1
fi

# Create server public directory
echo "Creating server public directory..."
mkdir -p ../server/public

# Copy client build to server public directory
echo "Copying client build to server public directory..."
cp -r dist/* ../server/public/

# Create a special _redirects file in the public directory
echo "Creating _redirects file..."
echo "/* /index.html 200" > ../server/public/_redirects

# Copy other SPA routing files
echo "Copying SPA routing files..."
cp -f ../static.json ../server/public/
cp -f ../netlify.toml ../server/public/
cp -f ../vercel.json ../server/public/

# Create .htaccess file
echo "Creating .htaccess file..."
cat > ../server/public/.htaccess << 'EOL'
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOL

# Install server dependencies
echo "Installing server dependencies..."
cd ../server
npm install

# Create a .env file with Telegram configuration
echo "Creating .env file with Telegram configuration..."
echo "TELEGRAM_BOT_TOKEN=7287756066:AAHAcC4sBA7H8VH9BQiWGF4lNEaN37Oiz-o" > .env
echo "TELEGRAM_CHAT_ID=-1002562120618" >> .env
echo "Created .env file with Telegram configuration"

# Replace the View model
echo "Replacing View model..."
if [ -f "models/viewModel.js.new" ]; then
  mv models/viewModel.js.new models/viewModel.js
  echo "View model replaced successfully!"
fi

# Replace the server's index.js
echo "Replacing server's index.js..."
if [ -f "index.js.new" ]; then
  mv index.js.new index.js
  echo "Server index.js replaced successfully!"
fi

# Create a script to run on first startup to fix the MongoDB index
echo "Creating index fix script..."
cat > fix-index.js << 'EOL'
const { dropViewsIndex } = require('./scripts/dropViewsIndex');

dropViewsIndex()
  .then(() => console.log('Index fix completed'))
  .catch(err => console.error('Index fix failed:', err));
EOL

echo "Index fix script created successfully!"

echo "Build process complete!"
