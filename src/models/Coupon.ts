import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  expiryDate: Date;
  active: boolean;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage', 'flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true },
  active: { type: Boolean, default: true },
});

import { wrapModel } from '@/lib/db';

const RealCoupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
const Coupon = wrapModel('Coupon', RealCoupon);
export default Coupon;
