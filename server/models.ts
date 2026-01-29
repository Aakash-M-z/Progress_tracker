import mongoose, { Schema, Document } from 'mongoose';

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user', required: true },
    createdAt: { type: Date, default: Date.now }
});

const activitySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    platform: { type: String, required: true },
    timeSpent: { type: Number, required: true },
    problemDescription: { type: String },
    notes: { type: String },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    solved: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model('User', userSchema);
export const ActivityModel = mongoose.model('Activity', activitySchema);
