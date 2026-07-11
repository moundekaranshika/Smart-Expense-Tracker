import mongoose from 'mongoose';
import { LocalCollection, isMongoDBConnected } from '../config/db';

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt?: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestion: { type: String },
  securityAnswer: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create Mongoose Model if mongoose is used
const MongooseUserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Create Local Model
const LocalUserModel = new LocalCollection<IUser>('users');

export const User = {
  async findOne(query: any): Promise<IUser | null> {
    if (isMongoDBConnected) {
      return await (MongooseUserModel as any).findOne(query).lean();
    }
    return await LocalUserModel.findOne(query);
  },

  async findById(id: string): Promise<IUser | null> {
    if (isMongoDBConnected) {
      return await (MongooseUserModel as any).findById(id).lean();
    }
    return await LocalUserModel.findById(id);
  },

  async create(data: Partial<IUser>): Promise<IUser> {
    if (isMongoDBConnected) {
      const user = new MongooseUserModel(data);
      const saved = await user.save();
      return saved.toObject();
    }
    return await LocalUserModel.create(data);
  },

  async findByIdAndUpdate(id: string, update: Partial<IUser>): Promise<IUser | null> {
    if (isMongoDBConnected) {
      return await (MongooseUserModel as any).findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    }
    return await LocalUserModel.findByIdAndUpdate(id, update);
  }
};
