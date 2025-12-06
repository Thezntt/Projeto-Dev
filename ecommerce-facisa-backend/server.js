import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';


import userRouter from './src/routers/user-router.js';
import productRouter from './src/routers/product-router.js';
import promotionRouter from './src/routers/promotion-router.js';
import authMiddleware from './src/auth-middleware.js';

dotenv.config();

const app = express();


mongoose.connect("mongodb://localhost:27017/ecommerce-facisa")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

app.use(express.json());
app.use(cors());

// ensure public/uploads exists and serve it
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));


app.use("/api/users", userRouter); 


app.use(authMiddleware);


app.use("/api/products", productRouter); 
app.use("/api/promotions", promotionRouter);

app.listen(3000, () => console.log("Server running on port 3000"));