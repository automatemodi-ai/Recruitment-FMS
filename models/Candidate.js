import mongoose from 'mongoose';

const stageHistorySchema = new mongoose.Schema({
  stage: { type: String, required: true },
  exited_at: { type: Date, default: Date.now }
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  requirement_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  source: { type: String, default: 'Other' },
  location: { type: String },
  experience: { type: String },
  expected: { type: String },
  current_ctc: { type: String },
  notice_period: { type: String },
  skills: { type: String },
  gender: { type: String },
  dob: { type: String },
  marital_status: { type: String },
  address: { type: String },
  referrer: { type: String },
  remarks: { type: String },
  screening_status: { type: String, default: 'Pending Review' },
  stage: { type: String, default: 'Application Received (New)' },
  stage_updated_at: { type: Date, default: Date.now },
  stage_history: [stageHistorySchema],
  next_action: { type: String },
  next_action_date: { type: String },
  interview_date: { type: String },
  interview_time: { type: String },
  interviewer: { type: String },
  interview_rating: { type: Number },
  interview_remarks: { type: String },
  offer_date: { type: String },
  offered_ctc: { type: String },
  joining_date: { type: String },
  rejection_reason: { type: String },
  cv_url: { type: String },
  cv_public_id: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);
export default Candidate;
