import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/laptop-shop';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('Found users:', users.length);
    users.forEach(u => {
      console.log(`- Email: ${u.email}, ID: ${u.id}, Username: ${u.username}`);
    });
    
    if (users.length === 0) {
      console.log('No users found. You should run node create-admin.js');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();
