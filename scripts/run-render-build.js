const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const serverDir = path.join(rootDir, 'server');
const clientDistDir = path.join(clientDir, 'dist');
const serverPublicDir = path.join(serverDir, 'public');
const npmCliPath = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
const npmInvocation = fs.existsSync(npmCliPath)
  ? { command: process.execPath, argsPrefix: [npmCliPath] }
  : { command: 'npm', argsPrefix: [] };

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    throw new Error(`Failed to run ${command} ${args.join(' ')}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with code ${result.status}`);
  }
};

const runNpm = (args, cwd) => {
  run(npmInvocation.command, [...npmInvocation.argsPrefix, ...args], cwd);
};

const installDependencies = (cwd) => {
  const hasPackageLock = fs.existsSync(path.join(cwd, 'package-lock.json'));
  const hasNodeModules = fs.existsSync(path.join(cwd, 'node_modules'));

  if (hasPackageLock && !hasNodeModules) {
    runNpm(['ci'], cwd);
    return;
  }

  runNpm(hasPackageLock ? ['install', '--package-lock=false'] : ['install'], cwd);
};

const removeDirectoryIfExists = (directoryPath) => {
  if (fs.existsSync(directoryPath)) {
    fs.rmSync(directoryPath, { recursive: true, force: true });
  }
};

const copyDirectoryContents = (sourceDir, destinationDir) => {
  fs.mkdirSync(destinationDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryContents(sourcePath, destinationPath);
      continue;
    }

    fs.copyFileSync(sourcePath, destinationPath);
  }
};

const copyIfExists = (fileName) => {
  const sourcePath = path.join(rootDir, fileName);
  const destinationPath = path.join(serverPublicDir, fileName);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destinationPath);
  }
};

const writeFile = (filePath, contents) => {
  fs.writeFileSync(filePath, contents.replace(/\n/g, '\r\n'), 'utf8');
};

try {
  console.log('Starting Render build process...');
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`Node version: ${process.version}`);
  runNpm(['--version'], rootDir);

  console.log('Installing client dependencies...');
  installDependencies(clientDir);

  console.log('Building client...');
  runNpm(['run', 'build'], clientDir);

  if (!fs.existsSync(clientDistDir)) {
    throw new Error('Client build failed: dist directory not found.');
  }

  console.log('Client build successful!');
  console.log('Creating server public directory...');
  fs.mkdirSync(serverPublicDir, { recursive: true });

  console.log('Copying client build to server public directory...');
  removeDirectoryIfExists(path.join(serverPublicDir, 'assets'));
  copyDirectoryContents(clientDistDir, serverPublicDir);

  console.log('Creating _redirects file...');
  writeFile(path.join(serverPublicDir, '_redirects'), '/* /index.html 200\n');

  console.log('Copying SPA routing files...');
  copyIfExists('static.json');
  copyIfExists('netlify.toml');
  copyIfExists('vercel.json');

  console.log('Creating .htaccess file...');
  writeFile(path.join(serverPublicDir, '.htaccess'), [
    'RewriteEngine On',
    'RewriteBase /',
    'RewriteRule ^index\\.html$ - [L]',
    'RewriteCond %{REQUEST_FILENAME} !-f',
    'RewriteCond %{REQUEST_FILENAME} !-d',
    'RewriteRule . /index.html [L]',
    '',
  ].join('\n'));

  console.log('Installing server dependencies...');
  installDependencies(serverDir);

  console.log('Note: Make sure to configure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in the Render dashboard');

  console.log('Replacing View model...');
  const newViewModel = path.join(serverDir, 'models', 'viewModel.js.new');
  if (fs.existsSync(newViewModel)) {
    fs.renameSync(newViewModel, path.join(serverDir, 'models', 'viewModel.js'));
    console.log('View model replaced successfully!');
  }

  console.log("Replacing server's index.js...");
  const newIndex = path.join(serverDir, 'index.js.new');
  if (fs.existsSync(newIndex)) {
    fs.renameSync(newIndex, path.join(serverDir, 'index.js'));
    console.log('Server index.js replaced successfully!');
  }

  console.log('Creating index fix script...');
  writeFile(path.join(serverDir, 'fix-index.js'), [
    "const { dropViewsIndex } = require('./scripts/dropViewsIndex');",
    '',
    'dropViewsIndex()',
    "  .then(() => console.log('Index fix completed'))",
    "  .catch(err => console.error('Index fix failed:', err));",
    '',
  ].join('\n'));
  console.log('Index fix script created successfully!');

  console.log('Build process complete!');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
