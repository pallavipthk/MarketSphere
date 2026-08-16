import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
}

const WishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
});

import { wrapModel } from '@/lib/db';

const RealWishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
const Wishlist = wrapModel('Wishlist', RealWishlist);
export default Wishlist;
