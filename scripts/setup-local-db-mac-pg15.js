#!/usr/bin/env node

// This script helps set up the local development database with PostgreSQL 15 on macOS
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

// Use absolute paths for PostgreSQL 15 binaries on macOS
const PG_BIN_PATH = '/opt/homebrew/opt/postgresql@15/bin';
const PSQL_PATH = `${PG_BIN_PATH}/psql`;
const CREATEDB_PATH = `${PG_BIN_PATH}/createdb`;

// Get current username as default
const currentUser = os.userInfo().username;

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
  console.log('🍸 Setting up local PostgreSQL 15 database for Bourbon Buddy development (macOS)');
  console.log('=====================================================\n');

  // Check if PostgreSQL 15 binaries exist
  if (!fs.existsSync(PSQL_PATH)) {
    console.error(`❌ Could not find PostgreSQL 15 binaries at ${PG_BIN_PATH}`);
    console.log('Make sure PostgreSQL 15 is installed via Homebrew');
    process.exit(1);
  }

  console.log(`✅ Found PostgreSQL 15 binaries at ${PG_BIN_PATH}`);

  const defaultDbName = 'bourbon_buddy';
  const defaultUsername = currentUser;  // Use current system user
  const defaultPassword = '';  // Empty default password

  console.log('\nThis script will help you set up a local PostgreSQL 15 database for development.');
  console.log('Make sure PostgreSQL 15 is running (brew services start postgresql@15).\n');

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
    // Test PostgreSQL connection using the absolute path to psql
    console.log('\n🔄 Testing PostgreSQL 15 connection...');
    try {
      // Try connecting to the default postgres database
      const psqlCmd = password 
        ? `PGPASSWORD="${password}" ${PSQL_PATH} -U ${username} -h localhost -p ${port} -d postgres -c "SELECT 1;"`
        : `${PSQL_PATH} -U ${username} -h localhost -p ${port} -d postgres -c "SELECT 1;"`;
      
      console.log(`Running: ${psqlCmd.replace(password, '*****')}`);
      execSync(psqlCmd, { stdio: 'inherit' });
      console.log('✅ Connection successful using psql');
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      
      // Try connecting to template1 as fallback
      try {
        console.log('\n🔄 Trying alternative connection to template1 database...');
        const psqlFallbackCmd = password 
          ? `PGPASSWORD="${password}" ${PSQL_PATH} -U ${username} -h localhost -p ${port} -d template1 -c "SELECT 1;"`
          : `${PSQL_PATH} -U ${username} -h localhost -p ${port} -d template1 -c "SELECT 1;"`;
        
        console.log(`Running: ${psqlFallbackCmd.replace(password, '*****')}`);
        execSync(psqlFallbackCmd, { stdio: 'inherit' });
        console.log('✅ Connection successful to template1');
      } catch (fallbackError) {
        console.error('❌ All connection attempts failed');
        throw new Error('Could not connect to PostgreSQL');
      }
    }

    // Create database if it doesn't exist
    console.log('\n🔄 Creating database if it doesn\'t exist...');
    try {
      const createDbCmd = password
        ? `PGPASSWORD="${password}" ${CREATEDB_PATH} -U ${username} -h localhost -p ${port} ${dbName}`
        : `${CREATEDB_PATH} -U ${username} -h localhost -p ${port} ${dbName}`;
      
      console.log(`Running: ${createDbCmd.replace(password, '*****')}`);
      execSync(createDbCmd, { stdio: 'inherit' });
      console.log(`✅ Database ${dbName} created`);
    } catch (error) {
      console.log(`ℹ️ Database ${dbName} may already exist or couldn't be created`);
      
      // Try to connect to the database to verify it exists
      try {
        const checkDbCmd = password
          ? `PGPASSWORD="${password}" ${PSQL_PATH} -U ${username} -h localhost -p ${port} -d ${dbName} -c "SELECT 1;"`
          : `${PSQL_PATH} -U ${username} -h localhost -p ${port} -d ${dbName} -c "SELECT 1;"`;
        
        console.log(`Running: ${checkDbCmd.replace(password, '*****')}`);
        execSync(checkDbCmd, { stdio: 'inherit' });
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
    console.log('1. PostgreSQL 15 is not running (run: brew services start postgresql@15)');
    console.log('2. Username/password is incorrect');
    console.log('3. Check that your user has permission to connect');
    console.log(`4. Try connecting manually: ${PSQL_PATH} -U <username> -h localhost`);
    console.log('\nPlease check these issues and try again.');
  }

  rl.close();
}

main().catch(console.error); 