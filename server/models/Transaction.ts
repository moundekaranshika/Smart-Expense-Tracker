import mongoose from 'mongoose';
import { LocalCollection, isMongoDBConnected } from '../config/db';

export interface ITransaction {
  _id?: string;
  id?: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO String format YYYY-MM-DD
  paymentMode: string; // Cash, Card, UPI, Net Banking, etc.
  type: 'income' | 'expense';
  createdAt?: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  paymentMode: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseTransactionModel = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
const LocalTransactionModel = new LocalCollection<ITransaction>('transactions');

export const Transaction = {
  async find(query: any): Promise<ITransaction[]> {
    if (isMongoDBConnected) {
      return await (MongooseTransactionModel as any).find(query).sort({ date: -1 }).lean();
    }
    const results = await LocalTransactionModel.find(query);
    return results.sort((a, b) => b.date.localeCompare(a.date));
  },

  async findOne(query: any): Promise<ITransaction | null> {
    if (isMongoDBConnected) {
      return await (MongooseTransactionModel as any).findOne(query).lean();
    }
    return await LocalTransactionModel.findOne(query);
  },

  async findById(id: string): Promise<ITransaction | null> {
    if (isMongoDBConnected) {
      return await (MongooseTransactionModel as any).findById(id).lean();
    }
    return await LocalTransactionModel.findById(id);
  },

  async create(data: Partial<ITransaction>): Promise<ITransaction> {
    if (isMongoDBConnected) {
      const tx = new MongooseTransactionModel(data);
      const saved = await tx.save();
      return saved.toObject();
    }
    return await LocalTransactionModel.create(data);
  },

  async findByIdAndUpdate(id: string, update: Partial<ITransaction>): Promise<ITransaction | null> {
    if (isMongoDBConnected) {
      return await (MongooseTransactionModel as any).findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    }
    return await LocalTransactionModel.findByIdAndUpdate(id, update);
  },

  async findByIdAndDelete(id: string): Promise<ITransaction | null> {
    if (isMongoDBConnected) {
      return await (MongooseTransactionModel as any).findByIdAndDelete(id).lean();
    }
    return await LocalTransactionModel.findByIdAndDelete(id);
  },

  async deleteMany(query: any): Promise<{ deletedCount: number }> {
    if (isMongoDBConnected) {
      return await (MongooseTransactionModel as any).deleteMany(query);
    }
    return await LocalTransactionModel.deleteMany(query);
  }
};
