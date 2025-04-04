#!/usr/bin/env node

// This script helps set up the local development database
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function main() {
  console.log('🍸 Setting up local database for Bourbon Buddy development');
  console.log('=====================================================\n');

  const defaultDbName = 'bourbon_buddy';
  const defaultUsername = 'postgres';
  const defaultPassword = 'postgres';

  console.log('This script will help you set up a local PostgreSQL database for development.');
  console.log('Make sure PostgreSQL is installed and running on your machine.\n');

  const dbName = await prompt(`Database name (default: ${defaultDbName}): `) || defaultDbName;
  const username = await prompt(`PostgreSQL username (default: ${defaultUsername}): `) || defaultUsername;
  const password = await prompt(`PostgreSQL password (default: ${defaultPassword}): `) || defaultPassword;
  const port = await prompt('PostgreSQL port (default: 5432): ') || '5432';

  // Create connection string
  const connectionString = `postgresql://${username}:${password}@localhost:${port}/${dbName}`;
  
  // Update .env.local file
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add LOCAL_DATABASE_URL
    if (envContent.includes('LOCAL_DATABASE_URL=')) {
      envContent = envContent.replace(
        /LOCAL_DATABASE_URL=.*\n/,
        `LOCAL_DATABASE_URL="${connectionString}"\n`
      );
    } else {
      envContent = `LOCAL_DATABASE_URL="${connectionString}"\n${envContent}`;
    }
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('\n✅ Updated LOCAL_DATABASE_URL in .env.local');
  } else {
    console.log('\n❌ .env.local file not found. Creating it...');
    fs.writeFileSync(envPath, `LOCAL_DATABASE_URL="${connectionString}"\n`, 'utf8');
    console.log('✅ Created .env.local with LOCAL_DATABASE_URL');
  }

  try {
    // Test PostgreSQL connection
    console.log('\n🔄 Testing PostgreSQL connection...');
    execSync(`psql "${connectionString}" -c "SELECT 1;"`, { stdio: 'ignore' });
    console.log('✅ Connection successful');

    // Create database if it doesn't exist
    console.log('\n🔄 Creating database if it doesn\'t exist...');
    try {
      execSync(`psql -U ${username} -h localhost -p ${port} -c "CREATE DATABASE ${dbName};"`, { stdio: 'ignore' });
      console.log(`✅ Database ${dbName} created`);
    } catch (error) {
      console.log(`ℹ️ Database ${dbName} may already exist`);
    }

    // Run Prisma migrations
    console.log('\n🔄 Running Prisma migrations...');
    process.env.DATABASE_URL = connectionString; // Temporarily override for migration
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Prisma migrations completed');

    console.log('\n🎉 Local database setup complete!');
    console.log(`\nConnection string: ${connectionString}`);
    console.log('\nYou can now run your application with the local database.');
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.log('\nPossible issues:');
    console.log('1. PostgreSQL is not installed or not running');
    console.log('2. Username/password is incorrect');
    console.log('3. Database doesn\'t exist and couldn\'t be created');
    console.log('\nPlease check these issues and try again.');
  }

  rl.close();
}

main().catch(console.error); 