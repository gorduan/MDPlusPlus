#!/usr/bin/env node
/**
 * MD++ Electron Start Script
 * Removes ELECTRON_RUN_AS_NODE to allow Electron to run properly from VSCode
 */
const { spawn } = require('child_process');
const path = require('path');

// Remove the env var that VSCode/Claude Code sets (which breaks Electron)
delete process.env.ELECTRON_RUN_AS_NODE;

// Get the project root
const projectRoot = path.resolve(__dirname, '..');

// Determine entry point - default to built output
const entryPoint = path.join(projectRoot, 'out', 'main', 'index.js');

console.log('Starting MD++ Electron app...');
console.log('Entry point:', entryPoint);
console.log('ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE);

// Get the electron executable path
const electronPath = require('electron');
console.log('Electron path:', electronPath);

// Start electron directly with the executable
const child = spawn(electronPath, [entryPoint], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: process.env,
  cwd: projectRoot
});

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('error', (err) => {
  console.error('Failed to start Electron:', err);
  process.exit(1);
});

child.on('close', (code) => {
  console.log('Electron exited with code:', code);
  process.exit(code || 0);
});
