import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: { type: String },
  googleId: { type: String, index: true },
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: '' },
  username: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  handles: {
    codeforces: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    atcoder: { type: String, default: '' },
    codechef: { type: String, default: '' },
    gfg: { type: String, default: '' },
    hackerrank: { type: String, default: '' }
  },
  verifiedHandles: {
    codeforces: { type: Boolean, default: false },
    leetcode: { type: Boolean, default: false },
    atcoder: { type: Boolean, default: false },
    codechef: { type: Boolean, default: false },
    gfg: { type: Boolean, default: false },
    hackerrank: { type: Boolean, default: false }
  },
  verificationTokens: { type: Map, of: String, default: {} },
  bookmarks: { type: Map, of: Boolean, default: {} },
  notes: { type: Map, of: Object, default: {} },
  potdCompletions: { type: Map, of: Boolean, default: {} },
  lastSyncStats: { type: Object, default: null },
  lastSyncedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false,
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
