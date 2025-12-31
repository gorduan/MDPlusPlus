const { spawn } = require('child_process');
const { join } = require('path');

// Start Vite dev server
const vite = spawn('npx', ['vite', '--port', '5555'], {
  cwd: join(__dirname, 'app/renderer'),
  shell: true,
  stdio: 'inherit'
});

// Wait for Vite to start, then launch Electron
setTimeout(() => {
  console.log('\n🚀 Starting Electron...\n');

  const electron = spawn('npx', ['electron', 'out/main/index.js'], {
    cwd: __dirname,
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_RENDERER_URL: 'http://localhost:5555'
    }
  });

  electron.on('close', () => {
    vite.kill();
    process.exit();
  });
}, 3000);

process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});
