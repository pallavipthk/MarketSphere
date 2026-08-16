import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'seller' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

import { wrapModel } from '@/lib/db';

const RealUser: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
const User = wrapModel('User', RealUser);
export default User;
