import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

export interface IShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  shippingAddress: IShippingAddress;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentId?: string;
  orderStatus: 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  name: { type: String },
  image: { type: String },
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    paymentId: { type: String },
    orderStatus: { type: String, enum: ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'], default: 'PLACED' },
  },
  { timestamps: true }
);

import { wrapModel } from '@/lib/db';

const RealOrder: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
const Order = wrapModel('Order', RealOrder);
export default Order;
