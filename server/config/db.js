// Unified Database Adapter: MongoDB Atlas (When MONGODB_URI is provided) + In-Memory Non-Persistent Fallback
import mongoose from 'mongoose';

// Ephemeral In-Memory Store (Active only when MONGODB_URI is not provided, never saved to disk)
const inMemoryDb = {
  users: [],
  problems: []
};

let isMongoConnected = false;

// Connect Database
export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (mongoUri && mongoUri.trim()) {
    try {
      console.log('🔄 Attempting MongoDB Atlas connection...');
      await mongoose.connect(mongoUri.trim(), {
        serverSelectionTimeoutMS: 5000
      });
      isMongoConnected = true;
      console.log('🍃 MongoDB Atlas Connected successfully to:', mongoUri.split('@').pop() || mongoUri);
      return { type: 'mongodb', uri: mongoUri };
    } catch (err) {
      console.warn(`⚠️ MongoDB Atlas connection failed (${err.message}). Using In-Memory Non-Persistent mode (no data will be saved to disk).`);
      isMongoConnected = false;
    }
  } else {
    console.log('ℹ️ No MONGODB_URI provided in .env. Running in In-Memory Non-Persistent mode (No data is saved to disk).');
    isMongoConnected = false;
  }

  return { type: 'in-memory' };
}

export function getDbStatus() {
  return {
    isMongo: isMongoConnected,
    type: isMongoConnected ? 'MongoDB Atlas' : 'In-Memory (Not saved to disk)',
    storagePath: isMongoConnected ? 'MongoDB Atlas Cloud' : 'RAM / Frontend Only'
  };
}

// Unified User Store API
export const UserStore = {
  async findOne(query) {
    if (isMongoConnected && mongoose.models.User) {
      const User = mongoose.model('User');
      return await User.findOne(query).lean();
    }
    
    return inMemoryDb.users.find(u => {
      for (const [key, val] of Object.entries(query)) {
        if (key === '$or' && Array.isArray(val)) {
          return val.some(subQ => Object.entries(subQ).every(([k, v]) => {
            if (typeof v === 'string' && typeof u[k] === 'string') {
              return u[k].toLowerCase() === v.toLowerCase();
            }
            return u[k] === v;
          }));
        }

        // Nested key lookup e.g. "handles.codeforces"
        if (key.startsWith('handles.')) {
          const platform = key.split('.')[1];
          const userHandle = u.handles?.[platform];
          if (!userHandle || !val) return false;
          return userHandle.toLowerCase() === val.toLowerCase();
        }

        if (key === '_id' && typeof val === 'object' && val.$ne) {
          if (u._id === val.$ne || u.id === val.$ne) return false;
          continue;
        }

        if (typeof val === 'string' && typeof u[key] === 'string') {
          if (u[key].toLowerCase() !== val.toLowerCase()) return false;
        } else if (u[key] !== val) {
          return false;
        }
      }
      return true;
    }) || null;
  },

  async findById(id) {
    if (isMongoConnected && mongoose.models.User) {
      const User = mongoose.model('User');
      return await User.findById(id).lean();
    }
    return inMemoryDb.users.find(u => u._id === id || u.id === id) || null;
  },

  async find(query = {}) {
    if (isMongoConnected && mongoose.models.User) {
      const User = mongoose.model('User');
      return await User.find(query).lean();
    }
    return inMemoryDb.users.filter(u => {
      for (const [k, v] of Object.entries(query)) {
        if (u[k] !== v) return false;
      }
      return true;
    });
  },

  async create(userData) {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newUser = {
      _id: id,
      id: id,
      role: 'user',
      handles: {
        codeforces: '',
        leetcode: '',
        atcoder: '',
        codechef: '',
        gfg: '',
        hackerrank: ''
      },
      verifiedHandles: {
        codeforces: false,
        leetcode: false,
        atcoder: false,
        codechef: false,
        gfg: false,
        hackerrank: false
      },
      verificationTokens: {},
      bookmarks: {},
      notes: {},
      potdCompletions: {},
      lastSyncStats: null,
      createdAt: now,
      updatedAt: now,
      ...userData
    };

    if (isMongoConnected && mongoose.models.User) {
      const User = mongoose.model('User');
      const doc = new User(newUser);
      await doc.save();
      return doc.toObject();
    }

    inMemoryDb.users.push(newUser);
    return newUser;
  },

  async updateById(id, updateData) {
    const now = new Date().toISOString();
    if (isMongoConnected && mongoose.models.User) {
      const User = mongoose.model('User');
      return await User.findByIdAndUpdate(id, { ...updateData, updatedAt: now }, { new: true }).lean();
    }

    const idx = inMemoryDb.users.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return null;

    inMemoryDb.users[idx] = {
      ...inMemoryDb.users[idx],
      ...updateData,
      updatedAt: now
    };
    return inMemoryDb.users[idx];
  },

  async deleteById(id) {
    if (isMongoConnected && mongoose.models.User) {
      const User = mongoose.model('User');
      const Problem = mongoose.model('Problem');
      await Problem.deleteMany({ userId: id });
      return await User.findByIdAndDelete(id);
    }
    const idx = inMemoryDb.users.findIndex(u => u._id === id || u.id === id);
    if (idx === -1) return false;
    inMemoryDb.users.splice(idx, 1);
    inMemoryDb.problems = (inMemoryDb.problems || []).filter(p => p.userId !== id);
    return true;
  }
};

// Unified Problem & Sync Store API
export const ProblemStore = {
  async saveUserProblems(userId, problems = []) {
    if (!userId) return 0;
    
    const userProblems = (problems || []).map(p => ({
      ...p,
      userId,
      updatedAt: new Date().toISOString()
    }));

    if (isMongoConnected && mongoose.models.Problem) {
      const Problem = mongoose.model('Problem');
      await Problem.deleteMany({ userId });
      if (userProblems.length > 0) {
        await Problem.insertMany(userProblems, { ordered: false });
      }
      return userProblems.length;
    }

    // In-memory update
    const otherUsersProblems = inMemoryDb.problems.filter(p => p.userId !== userId);
    inMemoryDb.problems = [...otherUsersProblems, ...userProblems];
    return userProblems.length;
  },

  async getUserProblems(userId) {
    if (!userId) return [];
    if (isMongoConnected && mongoose.models.Problem) {
      const Problem = mongoose.model('Problem');
      return await Problem.find({ userId }).sort({ timeSeconds: -1 }).lean();
    }
    return inMemoryDb.problems.filter(p => p.userId === userId).sort((a, b) => (b.timeSeconds || 0) - (a.timeSeconds || 0));
  }
};
