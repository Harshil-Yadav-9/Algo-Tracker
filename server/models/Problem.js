import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: String, required: true },
  platform: { type: String, required: true },
  platformKey: { type: String, required: true, index: true },
  problemId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  url: { type: String, default: '' },
  submissionUrl: { type: String, default: '' },
  rating: { type: Number, default: null },
  difficulty: { type: String, default: 'Medium' },
  concepts: [{ type: String }],
  verdict: { type: String, default: 'Solved' },
  rawVerdict: { type: String, default: 'OK' },
  passedTestCount: { type: Number, default: 1 },
  programmingLanguage: { type: String, default: '' },
  timeSeconds: { type: Number, default: 0, index: true },
  date: { type: String, default: '' }
}, {
  timestamps: true
});

ProblemSchema.index({ userId: 1, platformKey: 1, problemId: 1 }, { unique: true });

export const Problem = mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);
