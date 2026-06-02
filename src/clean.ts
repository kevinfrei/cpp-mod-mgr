import { $ } from 'bun';

async function Clean(): Promise<void> {
  await $`rm -rf build/Debug`;
  await $`rm -rf build/Release`;
}

Clean()
  .then(() => {})
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
