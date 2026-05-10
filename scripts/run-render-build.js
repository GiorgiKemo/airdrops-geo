const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(__dirname, '..', 'render-build.sh');

const result = spawnSync('bash', [scriptPath], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(`Failed to run render build script: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status || 0);
