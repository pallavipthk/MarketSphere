import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const CartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
});

import { wrapModel } from '@/lib/db';

const RealCart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
const Cart = wrapModel('Cart', RealCart);
export default Cart;
