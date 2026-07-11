import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Ensure data directory exists for local DB fallback
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_PATH = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({
    users: [],
    transactions: [],
    budgets: []
  }, null, 2));
}

export let isMongoDBConnected = false;

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('⚠️ No MONGODB_URI found in environment variables. Running in local-file database fallback mode.');
    isMongoDBConnected = false;
    return;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    isMongoDBConnected = true;
    console.log('✅ MongoDB Atlas connected successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️ Falling back to local-file database mode.');
    isMongoDBConnected = false;
  }
}

// Robust JSON-based lightweight query engine mimicking Mongoose
export class LocalCollection<T extends { id?: string; _id?: string; createdAt?: Date }> {
  private key: 'users' | 'transactions' | 'budgets';

  constructor(key: 'users' | 'transactions' | 'budgets') {
    this.key = key;
  }

  private read(): T[] {
    try {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed[this.key] || [];
    } catch {
      return [];
    }
  }

  private write(data: T[]) {
    try {
      const fileData = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      parsed[this.key] = data;
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error('Failed to write to local DB:', e);
    }
  }

  async find(query: any = {}): Promise<T[]> {
    let items = this.read();
    
    // Simple filter matching
    return items.filter(item => {
      for (const key in query) {
        if (query[key] === undefined) continue;
        
        // Handle MongoDB-like operator query if any (e.g. $gte, $lte)
        if (query[key] && typeof query[key] === 'object') {
          const val = (item as any)[key];
          const ops = query[key];
          
          if ('$gte' in ops && new Date(val) < new Date(ops.$gte)) return false;
          if ('$lte' in ops && new Date(val) > new Date(ops.$lte)) return false;
          if ('$regex' in ops) {
            const regex = new RegExp(ops.$regex, ops.$options || 'i');
            if (!regex.test(val)) return false;
          }
        } else {
          // Normal key-value check (normalize MongoDB _id and local id)
          const itemVal = key === '_id' ? (item.id || item._id) : (item as any)[key];
          const queryVal = key === '_id' ? query[key] : query[key];
          
          if (String(itemVal) !== String(queryVal)) return false;
        }
      }
      return true;
    });
  }

  async findOne(query: any = {}): Promise<T | null> {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id: string): Promise<T | null> {
    return this.findOne({ _id: id });
  }

  async create(data: Partial<T>): Promise<T> {
    const items = this.read();
    const newId = Math.random().toString(36).substring(2, 11);
    const newItem = {
      ...data,
      id: newId,
      _id: newId,
      createdAt: new Date()
    } as unknown as T;
    
    items.push(newItem);
    this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>, options = { new: true }): Promise<T | null> {
    const items = this.read();
    const idx = items.findIndex(item => (item.id || item._id) === id);
    if (idx === -1) return null;
    
    // Apply update (flatten $set structure if Mongoose style is used)
    const updatePayload = (update as any).$set ? (update as any).$set : update;
    items[idx] = {
      ...items[idx],
      ...updatePayload,
      updatedAt: new Date()
    };
    
    this.write(items);
    return items[idx];
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const items = this.read();
    const idx = items.findIndex(item => (item.id || item._id) === id);
    if (idx === -1) return null;
    
    const removed = items[idx];
    const updated = items.filter(item => (item.id || item._id) !== id);
    this.write(updated);
    return removed;
  }

  async deleteMany(query: any = {}): Promise<{ deletedCount: number }> {
    const items = this.read();
    const toKeep: T[] = [];
    let deletedCount = 0;

    for (const item of items) {
      let matches = true;
      for (const key in query) {
        const itemVal = key === '_id' ? (item.id || item._id) : (item as any)[key];
        if (String(itemVal) !== String(query[key])) {
          matches = false;
          break;
        }
      }
      if (matches) {
        deletedCount++;
      } else {
        toKeep.push(item);
      }
    }

    this.write(toKeep);
    return { deletedCount };
  }
}
