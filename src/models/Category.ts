import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
  }
);

import { wrapModel } from '@/lib/db';

const RealCategory: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
const Category = wrapModel('Category', RealCategory);
export default Category;
