#!/usr/bin/env node

// Fix migration files for PostgreSQL compatibility
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');

console.log('🔧 Fixing migration files for PostgreSQL compatibility');
console.log('===================================================\n');

// Get all migration directories
const migrationDirs = fs.readdirSync(migrationsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let totalDatetimeFixes = 0;
let totalPragmaFixes = 0;

// Fixes to apply
const fixes = [
  {
    pattern: /DATETIME/g,
    replacement: 'TIMESTAMP',
    counter: 0,
    description: 'DATETIME to TIMESTAMP'
  },
  {
    pattern: /PRAGMA foreign_keys=OFF;/g,
    replacement: '-- PRAGMA foreign_keys=OFF; -- Removed for PostgreSQL compatibility',
    counter: 0,
    description: 'Remove PRAGMA foreign_keys=OFF'
  },
  {
    pattern: /PRAGMA defer_foreign_keys=ON;/g,
    replacement: '-- PRAGMA defer_foreign_keys=ON; -- Removed for PostgreSQL compatibility', 
    counter: 0,
    description: 'Remove PRAGMA defer_foreign_keys=ON'
  },
  {
    pattern: /PRAGMA foreign_keys=ON;/g,
    replacement: '-- PRAGMA foreign_keys=ON; -- Removed for PostgreSQL compatibility',
    counter: 0,
    description: 'Remove PRAGMA foreign_keys=ON'
  }
];

migrationDirs.forEach(migrationDir => {
  const migrationFilePath = path.join(migrationsDir, migrationDir, 'migration.sql');
  
  if (fs.existsSync(migrationFilePath)) {
    let content = fs.readFileSync(migrationFilePath, 'utf8');
    let fileChanged = false;
    let fileReport = '';
    
    // Apply each fix
    fixes.forEach(fix => {
      // Count instances before replacement
      const beforeCount = (content.match(fix.pattern) || []).length;
      
      if (beforeCount > 0) {
        // Apply replacement
        content = content.replace(fix.pattern, fix.replacement);
        
        fix.counter += beforeCount;
        fileChanged = true;
        fileReport += `  - ${fix.description}: ${beforeCount} replacements\n`;
      }
    });
    
    if (fileChanged) {
      // Save the file
      fs.writeFileSync(migrationFilePath, content, 'utf8');
      console.log(`✅ Fixed ${migrationDir}/migration.sql:`);
      console.log(fileReport);
    } else {
      console.log(`ℹ️ No fixes needed for ${migrationDir}/migration.sql`);
    }
  } else {
    console.log(`⚠️ No migration.sql file found in ${migrationDir}`);
  }
});

console.log('\n🎉 Fixed migration files successfully:');
fixes.forEach(fix => {
  console.log(`  - ${fix.description}: ${fix.counter} total replacements`);
});

console.log('\nNow you can run Prisma migrations safely on PostgreSQL.'); 