import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStore extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  logo?: string;
  location: string;
  createdAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String, default: '' },
    location: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

import { wrapModel } from '@/lib/db';

const RealStore: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);
const Store = wrapModel('Store', RealStore);
export default Store;
