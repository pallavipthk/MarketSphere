import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

import { wrapModel } from '@/lib/db';

const RealReview: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
const Review = wrapModel('Review', RealReview);
export default Review;
