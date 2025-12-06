import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    expirationDate: { type: Date, required: true }
});

const Product = mongoose.model("Product", productSchema);
export default Product;