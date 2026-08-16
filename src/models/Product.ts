import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    image: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

import { wrapModel } from '@/lib/db';

const RealProduct: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
const Product = wrapModel('Product', RealProduct);
export default Product;
