import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Get MongoDB URI with fallback options
const getMongoURI = () => {
  return process.env.MONGODB_URI || 
         process.env.DATABASE_URL || 
         process.env.DB_URI || 
         process.env.MONGO_URI ||
         'mongodb://localhost:27017/bustracker';
};

// Connect to MongoDB
mongoose.connect(getMongoURI(), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log(`📍 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('🔧 Please check your MongoDB connection string');
  process.exit(1);
});

// Default users
const defaultUsers = [
  {
    name: 'student1',
    password: 'password123',
    role: 'student'
  },
  {
    name: 'admin1',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'john',
    password: 'password123',
    role: 'student'
  },
  {
    name: 'admin',
    password: 'admin123',
    role: 'admin'
  }
];

async function createUsers() {
  try {
    console.log('🔄 Creating default users...');
    
    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ name: userData.name });
      
      if (existingUser) {
        console.log(`⚠️ User ${userData.name} already exists, skipping...`);
        continue;
      }
      
      // Create new user
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.name} (${userData.role})`);
    }
    
    console.log('🎉 Default users created successfully!');
    console.log('\n📋 Available users:');
    console.log('Student: student1 / password123');
    console.log('Admin: admin1 / admin123');
    console.log('Student: john / password123');
    console.log('Admin: admin / admin123');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

createUsers(); 