import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'mock_db.json');

// Interface for mock document
interface MockDoc {
  _id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

class MockQuery {
  private data: any;

  constructor(data: any) {
    this.data = data;
  }

  populate(pathStr?: any, selectStr?: any) {
    // Simulated populate for storeId, sellerId, and userId
    if (Array.isArray(this.data)) {
      this.data = this.data.map(item => this.populateItem(item));
    } else if (this.data) {
      this.data = this.populateItem(this.data);
    }
    return this;
  }

  private populateItem(item: any) {
    if (!item) return item;
    const db = loadData();
    const newItem = { ...item };

    // Populate storeId
    if (newItem.storeId && typeof newItem.storeId === 'string') {
      const store = db.stores.find((s: any) => s._id === newItem.storeId);
      if (store) newItem.storeId = store;
    }

    // Populate sellerId
    if (newItem.sellerId && typeof newItem.sellerId === 'string') {
      const seller = db.users.find((u: any) => u._id === newItem.sellerId);
      if (seller) {
        newItem.sellerId = { _id: seller._id, name: seller.name, email: seller.email };
      }
    }

    // Populate userId
    if (newItem.userId && typeof newItem.userId === 'string') {
      const user = db.users.find((u: any) => u._id === newItem.userId);
      if (user) {
        newItem.userId = { _id: user._id, name: user.name, email: user.email, avatar: user.avatar };
      }
    }

    // Populate items.productId
    if (newItem.items && Array.isArray(newItem.items)) {
      newItem.items = newItem.items.map((cartItem: any) => {
        if (cartItem.productId && typeof cartItem.productId === 'string') {
          const product = db.products.find((p: any) => p._id === cartItem.productId);
          return { ...cartItem, productId: product || cartItem.productId };
        }
        return cartItem;
      });
    }

    // Populate products in wishlist
    if (newItem.products && Array.isArray(newItem.products)) {
      newItem.products = newItem.products.map((pId: any) => {
        if (typeof pId === 'string') {
          const product = db.products.find((p: any) => p._id === pId);
          return product || pId;
        }
        return pId;
      });
    }

    return newItem;
  }

  select(fields?: any) {
    return this;
  }

  sort(sortOptions?: any) {
    if (sortOptions && Array.isArray(this.data)) {
      const keys = Object.keys(sortOptions);
      if (keys.length > 0) {
        const key = keys[0];
        const order = sortOptions[key];
        this.data.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return -1 * order;
          if (valA > valB) return 1 * order;
          return 0;
        });
      }
    }
    return this;
  }

  limit(num: number) {
    if (Array.isArray(this.data)) {
      this.data = this.data.slice(0, num);
    }
    return this;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    // Support toObject() simulation on return values
    let val = this.data;
    if (Array.isArray(val)) {
      val = val.map(item => {
        if (!item) return item;
        const newItem = { ...item };
        Object.defineProperty(newItem, 'toObject', {
          value: () => newItem,
          enumerable: false,
          configurable: true,
          writable: true,
        });
        return newItem;
      });
    } else if (val) {
      const newItem = { ...val };
      Object.defineProperty(newItem, 'toObject', {
        value: () => newItem,
        enumerable: false,
        configurable: true,
        writable: true,
      });
      val = newItem;
    }
    return Promise.resolve(val).then(onfulfilled, onrejected);
  }
}

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      users: [],
      stores: [],
      categories: [],
      products: [],
      carts: [],
      orders: [],
      coupons: [],
      reviews: [],
      wishlists: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveData(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

class MockCollection {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  private getCollectionData() {
    const db = loadData();
    return db[this.name] || [];
  }

  private setCollectionData(data: any[]) {
    const db = loadData();
    db[this.name] = data;
    saveData(db);
  }

  private filterData(query: any, data: any[]) {
    if (!query || Object.keys(query).length === 0) return data;
    return data.filter((item) => {
      for (const key in query) {
        const val = query[key];
        
        // Handle regex matching (e.g. search query)
        if (val && typeof val === 'object' && val.$regex) {
          const regex = new RegExp(val.$regex, val.$options || '');
          if (!regex.test(item[key] || '')) return false;
          continue;
        }

        // Handle OR query
        if (key === '$or' && Array.isArray(val)) {
          const matchOr = val.some((subQuery) => {
            const subKey = Object.keys(subQuery)[0];
            const subVal = subQuery[subKey];
            if (subVal && typeof subVal === 'object' && subVal.$regex) {
              const r = new RegExp(subVal.$regex, subVal.$options || '');
              return r.test(item[subKey] || '');
            }
            return item[subKey] === subVal;
          });
          if (!matchOr) return false;
          continue;
        }

        // Handle operators like $gte, $lte, $inc
        if (val && typeof val === 'object') {
          if (val.$gte !== undefined && item[key] < val.$gte) return false;
          if (val.$lte !== undefined && item[key] > val.$lte) return false;
          continue;
        }

        if (item[key] !== val) return false;
      }
      return true;
    });
  }

  find(query?: any) {
    const data = this.getCollectionData();
    const filtered = this.filterData(query, data);
    return new MockQuery(filtered);
  }

  findOne(query?: any) {
    const data = this.getCollectionData();
    const filtered = this.filterData(query, data);
    return new MockQuery(filtered[0] || null);
  }

  findById(id: string) {
    const data = this.getCollectionData();
    const match = data.find((item: any) => item._id === id || item._id?.toString() === id);
    return new MockQuery(match || null);
  }

  async create(doc: any) {
    const data = this.getCollectionData();
    const newDoc: MockDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc,
    };
    data.push(newDoc);
    this.setCollectionData(data);
    
    // Simulate save helper
    const result = { ...newDoc };
    Object.defineProperty(result, 'save', {
      value: async function() { return this; },
      enumerable: false,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(result, 'toObject', {
      value: () => newDoc,
      enumerable: false,
      configurable: true,
      writable: true,
    });
    return result;
  }

  async insertMany(arr: any[]) {
    const data = this.getCollectionData();
    const newDocs = arr.map((doc) => ({
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc,
    }));
    data.push(...newDocs);
    this.setCollectionData(data);
    return newDocs;
  }

  async findOneAndUpdate(query: any, update: any, options?: any) {
    const data = this.getCollectionData();
    const filtered = this.filterData(query, data);
    if (filtered.length === 0) {
      if (options?.upsert) {
        // Simple upsert
        return this.create({ ...query, ...update });
      }
      return null;
    }
    const doc = filtered[0];
    const idx = data.findIndex((item: any) => item._id === doc._id);

    // Apply updates
    const updatedDoc = { ...doc };
    if (update.$inc) {
      for (const k in update.$inc) {
        updatedDoc[k] = (updatedDoc[k] || 0) + update.$inc[k];
      }
    }
    if (update.$set) {
      Object.assign(updatedDoc, update.$set);
    } else if (!update.$inc) {
      Object.assign(updatedDoc, update);
    }
    
    updatedDoc.updatedAt = new Date().toISOString();
    data[idx] = updatedDoc;
    this.setCollectionData(data);
    return updatedDoc;
  }

  async findByIdAndUpdate(id: string, update: any, options?: any) {
    return this.findOneAndUpdate({ _id: id }, update, options);
  }

  async deleteMany(query?: any) {
    if (!query || Object.keys(query).length === 0) {
      this.setCollectionData([]);
      return { deletedCount: 0 };
    }
    const data = this.getCollectionData();
    const filtered = this.filterData(query, data);
    const toKeep = data.filter((item: any) => !filtered.some((f: any) => f._id === item._id));
    this.setCollectionData(toKeep);
    return { deletedCount: filtered.length };
  }

  async findByIdAndDelete(id: string) {
    return this.deleteMany({ _id: id });
  }

  async countDocuments(query?: any) {
    const data = this.getCollectionData();
    const filtered = this.filterData(query, data);
    return filtered.length;
  }

  async aggregate(pipeline?: any[]) {
    // Simple mock aggregate for order revenues
    const data = this.getCollectionData();
    const sumResult = data.reduce((sum: number, order: any) => sum + (order.finalAmount || 0), 0);
    return [{ total: sumResult }];
  }
}

export const mockDb: { [key: string]: MockCollection } = {
  users: new MockCollection('users'),
  stores: new MockCollection('stores'),
  categories: new MockCollection('categories'),
  products: new MockCollection('products'),
  carts: new MockCollection('carts'),
  orders: new MockCollection('orders'),
  coupons: new MockCollection('coupons'),
  reviews: new MockCollection('reviews'),
  wishlists: new MockCollection('wishlists'),
};
