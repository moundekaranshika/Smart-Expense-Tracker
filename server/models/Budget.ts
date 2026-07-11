import mongoose from 'mongoose';
import { LocalCollection, isMongoDBConnected } from '../config/db';

export interface IBudget {
  _id?: string;
  id?: string;
  userId: string;
  category: string; // "All" or specific category (Food, Shopping, etc.)
  limit: number;
  month: string; // YYYY-MM
  createdAt?: Date;
}

const BudgetSchema = new mongoose.Schema<IBudget>({
  userId: { type: String, required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  month: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseBudgetModel = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
const LocalBudgetModel = new LocalCollection<IBudget>('budgets');

export const Budget = {
  async find(query: any): Promise<IBudget[]> {
    if (isMongoDBConnected) {
      return await (MongooseBudgetModel as any).find(query).lean();
    }
    return await LocalBudgetModel.find(query);
  },

  async findOne(query: any): Promise<IBudget | null> {
    if (isMongoDBConnected) {
      return await (MongooseBudgetModel as any).findOne(query).lean();
    }
    return await LocalBudgetModel.findOne(query);
  },

  async findById(id: string): Promise<IBudget | null> {
    if (isMongoDBConnected) {
      return await (MongooseBudgetModel as any).findById(id).lean();
    }
    return await LocalBudgetModel.findById(id);
  },

  async create(data: Partial<IBudget>): Promise<IBudget> {
    if (isMongoDBConnected) {
      const budget = new MongooseBudgetModel(data);
      const saved = await budget.save();
      return saved.toObject();
    }
    return await LocalBudgetModel.create(data);
  },

  async findByIdAndUpdate(id: string, update: Partial<IBudget>): Promise<IBudget | null> {
    if (isMongoDBConnected) {
      return await (MongooseBudgetModel as any).findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    }
    return await LocalBudgetModel.findByIdAndUpdate(id, update);
  },

  async findByIdAndDelete(id: string): Promise<IBudget | null> {
    if (isMongoDBConnected) {
      return await (MongooseBudgetModel as any).findByIdAndDelete(id).lean();
    }
    return await LocalBudgetModel.findByIdAndDelete(id);
  }
};
