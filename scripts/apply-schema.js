#!/usr/bin/env node

// Apply Prisma schema directly to the database without migrations
const { execSync } = require('child_process');
const path = require('path');

// Get database URL from command line or environment
const dbUrl = process.env.DATABASE_URL || "postgresql://eliasbouzeid@localhost:5432/bourbon_buddy";

console.log('🔧 Applying Prisma schema directly to the database');
console.log('===============================================\n');

console.log(`Using database: ${dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//[username]:[password]@')}`);

try {
  // Generate a clean database without migrations
  console.log('\n1. Generating database from schema...');
  execSync(`DATABASE_URL="${dbUrl}" npx prisma db push --force-reset --accept-data-loss`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
  
  console.log('\n✅ Successfully applied schema to database!');
  console.log('\nYou can now use your local database for development.');
} catch (error) {
  console.error('\n❌ Error applying schema:', error.message);
} 