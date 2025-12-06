import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

dotenv.config();

const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce-facisa';

import User from '../src/models/user-model.js';
import Product from '../src/models/product-model.js';
import Promotion from '../src/models/promotion-model.js';

async function run() {
  await mongoose.connect(MONGO);
  console.log('Connected to', MONGO);

  // Cleanup
  await User.deleteMany({});
  await Product.deleteMany({});
  await Promotion.deleteMany({});

  // Create products
  const products = await Product.create([
    { name: 'Picanha', description: 'Carne bovina especial', price: 50.0, category: 'carnes', expirationDate: new Date('2025-12-31') },
    { name: 'Maçã', description: 'Maçã gala', price: 3.5, category: 'frutas', expirationDate: new Date('2025-12-15') },
  ]);

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(8).toString('hex'); // Senha aleatória
  const adminPassHash = await bcrypt.hash(adminPassword, 10);

  const admin = await User.create({ username: 'admin', email: adminEmail, password: adminPassHash, cpf: '00000000000', role: 'admin', preferences: [] });

  console.log('Seed completed:');
  console.log('Admin:', admin.email, 'Senha gerada:', adminPassword);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
