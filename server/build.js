const { execSync } = require('child_process');
const path = require('path');

// Override DATABASE_URL for build time to prevent Prisma from trying to access
// the persistent volume /var/data which is not mounted during Render's build phase.
process.env.DATABASE_URL = 'file:./prisma/dev.db';

try {
  console.log('Building: Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('Building: Compiling TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  console.log('Building: Completed successfully.');
} catch (err) {
  console.error('Building: Failed during build step.', err.message || err);
  process.exit(1);
}
