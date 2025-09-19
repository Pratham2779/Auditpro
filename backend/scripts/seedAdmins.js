import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {connectDB} from '../src/configs/db/index.js';
import { User } from '../src/models/user.model.js';

dotenv.config();
await connectDB();

const admins = [
  {
    fullName: process.env.ADMIN_NAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@email.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    phoneNumber: process.env.ADMIN_PHONE_NUMBER || '+910123456789',
    gender: process.env.ADMIN_GENDER || 'Male',
  },
];

for (const admin of admins) {
  const exists = await User.findOne({ email: admin.email });
  if (exists) {
    console.log(` Admin already exists: ${admin.email}`);
    continue;
  }

  const hashedPassword = await bcrypt.hash(admin.password, 10);

  await User.create({
    ...admin,
    password: hashedPassword,
    role: 'admin',
    isEmailVerified: true,
  });

  console.log(` Admin created: ${admin.email}`);
}

process.exit();
