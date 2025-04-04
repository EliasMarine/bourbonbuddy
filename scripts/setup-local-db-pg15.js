#!/usr/bin/env node

// This script helps set up the local development database with PostgreSQL 15
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
  console.log('🍸 Setting up local PostgreSQL 15 database for Bourbon Buddy development');
  console.log('=====================================================\n');

  const defaultDbName = 'bourbon_buddy';
  const defaultUsername = 'postgres';
  const defaultPassword = '';  // Empty default password

  console.log('This script will help you set up a local PostgreSQL 15 database for development.');
  console.log('Make sure PostgreSQL 15 is installed and running on your machine.\n');

  const dbName = await prompt(`Database name (default: ${defaultDbName}): `) || defaultDbName;
  const username = await prompt(`PostgreSQL username (default: ${defaultUsername}): `) || defaultUsername;
  const password = await prompt(`PostgreSQL password (if any, leave empty for no password): `) || defaultPassword;
  const port = await prompt('PostgreSQL port (default: 5432): ') || '5432';
  
  // Create connection string with proper password handling
  let connectionString;
  if (password) {
    connectionString = `postgresql://${username}:${password}@localhost:${port}/${dbName}`;
  } else {
    connectionString = `postgresql://${username}@localhost:${port}/${dbName}`;
  }
  
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
    // Test PostgreSQL connection using psql15 if available
    console.log('\n🔄 Testing PostgreSQL 15 connection...');
    try {
      // Try with psql15 command first
      const psqlCmd = password 
        ? `PGPASSWORD="${password}" psql15 -U ${username} -h localhost -p ${port} -d postgres -c "SELECT 1;"`
        : `psql15 -U ${username} -h localhost -p ${port} -d postgres -c "SELECT 1;"`;
      execSync(psqlCmd, { stdio: 'ignore' });
      console.log('✅ Connection successful using psql15');
    } catch (error) {
      // Fall back to regular psql command
      const psqlCmd = password 
        ? `PGPASSWORD="${password}" psql -U ${username} -h localhost -p ${port} -d postgres -c "SELECT 1;"`
        : `psql -U ${username} -h localhost -p ${port} -d postgres -c "SELECT 1;"`;
      execSync(psqlCmd, { stdio: 'ignore' });
      console.log('✅ Connection successful using psql');
    }

    // Create database if it doesn't exist
    console.log('\n🔄 Creating database if it doesn\'t exist...');
    try {
      const createDbCmd = password
        ? `PGPASSWORD="${password}" createdb -U ${username} -h localhost -p ${port} ${dbName}`
        : `createdb -U ${username} -h localhost -p ${port} ${dbName}`;
      execSync(createDbCmd, { stdio: 'ignore' });
      console.log(`✅ Database ${dbName} created`);
    } catch (error) {
      console.log(`ℹ️ Database ${dbName} may already exist or couldn't be created`);
      
      // Try to connect to the database to verify it exists
      try {
        const checkDbCmd = password
          ? `PGPASSWORD="${password}" psql -U ${username} -h localhost -p ${port} -d ${dbName} -c "SELECT 1;"`
          : `psql -U ${username} -h localhost -p ${port} -d ${dbName} -c "SELECT 1;"`;
        execSync(checkDbCmd, { stdio: 'ignore' });
        console.log(`✅ Confirmed database ${dbName} exists`);
      } catch (dbCheckError) {
        console.error(`❌ Cannot connect to database ${dbName}:`, dbCheckError.message);
        throw new Error(`Database connection failed`);
      }
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
    console.log('1. PostgreSQL 15 is not installed or not running');
    console.log('2. Username/password is incorrect');
    console.log('3. Database doesn\'t exist and couldn\'t be created');
    console.log('4. Try running as a user with appropriate PostgreSQL permissions');
    console.log('\nPlease check these issues and try again.');
  }

  rl.close();
}

main().catch(console.error); 