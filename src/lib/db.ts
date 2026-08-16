import mongoose from 'mongoose';
import { mockDb } from './mockDb';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if ((global as any).mongooseOffline) {
    return mongoose;
  }
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,
    };

    if (!MONGODB_URI) {
      console.warn('MONGODB_URI missing. Switching to local file-based database.');
      (global as any).mongooseOffline = true;
      return mongoose;
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      console.log('Connected to MongoDB successfully.');
      return m;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.warn('MongoDB connection failed. Switching to local file-based database.');
    (global as any).mongooseOffline = true;
    return mongoose;
  }

  return cached.conn;
}

export function wrapModel(modelName: string, realModel: any) {
  return new Proxy(realModel, {
    get(target, prop, receiver) {
      if ((global as any).mongooseOffline) {
        let pluralName = modelName.toLowerCase();
        if (pluralName.endsWith('y')) {
          pluralName = pluralName.slice(0, -1) + 'ies';
        } else {
          pluralName += 's';
        }
        const mockCollection = mockDb[pluralName];
        if (mockCollection && typeof (mockCollection as any)[prop] === 'function') {
          return (mockCollection as any)[prop].bind(mockCollection);
        }
        console.warn(`Mock method ${modelName}.${String(prop)} not found.`);
        return () => Promise.resolve(null);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

export default connectDB;
