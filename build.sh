#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

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

# Copy client build to server public directory
echo "Copying client build to server public directory..."
mkdir -p ../server/public
cp -r dist/* ../server/public/

# Install server dependencies
echo "Installing server dependencies..."
cd ../server
npm install

echo "Build process complete!"
