const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// New dependencies to add
const newDependencies = {
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5",
  "express-validator": "^7.0.1",
  "helmet": "^7.1.0",
  "joi": "^17.11.0",
  "morgan": "^1.10.0",
  "winston": "^3.11.0"
};

// Add new dependencies
packageJson.dependencies = {
  ...packageJson.dependencies,
  ...newDependencies
};

// Update scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "start": "node server/server.js",
  "dev": "nodemon server/server.js",
  "test": "jest --watchAll --verbose"
};

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('package.json updated with new dependencies and scripts.');
console.log('Run "npm install" to install the new dependencies.');
