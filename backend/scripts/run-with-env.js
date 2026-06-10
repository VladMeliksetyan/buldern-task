import { spawnSync } from 'node:child_process';

const [, , ...args] = process.argv;
const result = spawnSync('npx', args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
