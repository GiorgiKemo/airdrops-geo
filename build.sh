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

# Create server public directory
echo "Creating server public directory..."
mkdir -p ../server/public

# Copy client build to server public directory
echo "Copying client build to server public directory..."
cp -r dist/* ../server/public/

# Create a special _redirects file in the public directory
echo "Creating _redirects file..."
echo "/* /index.html 200" > ../server/public/_redirects

# Create a web.config file for IIS
echo "Creating web.config file..."
cat > ../server/public/web.config << 'EOL'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
EOL

# Install server dependencies
echo "Installing server dependencies..."
cd ../server
npm install

# Replace the server's index.js with our new version
echo "Replacing server's index.js..."
if [ -f "index.js.new" ]; then
  mv index.js.new index.js
  echo "Server index.js replaced successfully!"
fi

echo "Build process complete!"
