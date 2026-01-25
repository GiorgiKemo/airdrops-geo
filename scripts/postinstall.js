const { spawnSync } = require('child_process');
const path = require('path');

const isRender =
  process.env.RENDER === 'true' ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  Boolean(process.env.RENDER_INSTANCE_ID);

if (!isRender) {
  console.log('Skipping root postinstall render build outside Render environment.');
  process.exit(0);
}

const scriptPath = path.resolve(__dirname, 'run-render-build.js');
const result = spawnSync(process.execPath, [scriptPath], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(`Postinstall failed: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status || 0);
