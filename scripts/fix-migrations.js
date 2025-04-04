#!/usr/bin/env node

// Fix PostgreSQL migration files to replace DATETIME with TIMESTAMP
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');

console.log('🔧 Fixing migration files for PostgreSQL compatibility');
console.log('===================================================\n');

// Get all migration directories
const migrationDirs = fs.readdirSync(migrationsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let totalFixed = 0;

migrationDirs.forEach(migrationDir => {
  const migrationFilePath = path.join(migrationsDir, migrationDir, 'migration.sql');
  
  if (fs.existsSync(migrationFilePath)) {
    let content = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Count instances before replacement
    const beforeCount = (content.match(/DATETIME/g) || []).length;
    
    if (beforeCount > 0) {
      // Replace DATETIME with TIMESTAMP
      content = content.replace(/DATETIME/g, 'TIMESTAMP');
      
      // Save the file
      fs.writeFileSync(migrationFilePath, content, 'utf8');
      
      console.log(`✅ Fixed ${migrationDir}/migration.sql (${beforeCount} replacements)`);
      totalFixed += beforeCount;
    } else {
      console.log(`ℹ️ No fixes needed for ${migrationDir}/migration.sql`);
    }
  } else {
    console.log(`⚠️ No migration.sql file found in ${migrationDir}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} DATETIME references in migration files`);
console.log('\nNow you can run Prisma migrations safely on PostgreSQL.'); 