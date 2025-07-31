import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 BusTracker Environment Setup');
console.log('==============================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📋 Current environment variables:');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      console.log(`   ${line}`);
    }
  });
} else {
  console.log('⚠️  No .env file found');
}

console.log('\n🔍 Checking for MongoDB environment variables...');

// Check for various MongoDB URI environment variables
const mongoVars = [
  'MONGODB_URI',
  'DATABASE_URL', 
  'DB_URI',
  'MONGO_URI'
];

let foundVar = null;
mongoVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ Found: ${varName} = ${process.env[varName]}`);
    foundVar = varName;
  }
});

if (!foundVar) {
  console.log('❌ No MongoDB URI environment variable found');
  console.log('\n💡 To set up your MongoDB connection, you can:');
  console.log('   1. Create a .env file in the backend directory');
  console.log('   2. Add your MongoDB URI to the .env file');
  console.log('   3. Use one of these variable names:');
  mongoVars.forEach(varName => {
    console.log(`      - ${varName}`);
  });
  console.log('\n📝 Example .env file content:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/bustracker');
  console.log('   JWT_SECRET=your-super-secret-jwt-key');
  console.log('   PORT=5000');
} else {
  console.log(`\n✅ Using MongoDB URI from: ${foundVar}`);
}

console.log('\n🚀 Next steps:');
console.log('   1. Make sure MongoDB is running');
console.log('   2. Run: npm run create-users');
console.log('   3. Run: npm run dev');
console.log('\n📚 For more help, see AUTHENTICATION.md'); 