import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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

  // Create users
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  const admin = await User.create({ username: 'admin', email: 'admin@example.com', password: adminPass, cpf: '00000000000', role: 'admin', preferences: [] });
  const user = await User.create({ username: 'joao', email: 'joao@example.com', password: userPass, cpf: '11111111111', role: 'user', preferences: ['carnes'] });

  // Create promotions
  const promo = await Promotion.create({ productId: products[0]._id, discountPercentage: 20, startDate: new Date('2025-12-01'), endDate: new Date('2025-12-31'), targetPreferences: ['carnes'], targetUserIds: [] });

  console.log('Seed completed:');
  console.log('Admin:', admin.email, 'pwd: admin123');
  console.log('User:', user.email, 'pwd: user123');
  console.log('Products:', products.map(p => p.name));
  console.log('Promotion created for product:', products[0].name);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
