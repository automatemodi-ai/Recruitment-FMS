import mongoose from 'mongoose';

const stageHistorySchema = new mongoose.Schema({
  stage: { type: String, required: true },
  to_stage: { type: String },
  entered_at: { type: Date },
  exited_at: { type: Date, default: Date.now },
  completed_at: { type: Date },
  duration: { type: String },
  notes: { type: String }
}, { _id: false });

const stageTimestampSchema = new mongoose.Schema({
  entered_at: { type: Date },
  completed_at: { type: Date }
}, { _id: false });

const vacancySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, default: 'Medium' },
  owner: { type: String, default: 'HR Manager' },
  deadline: { type: String },
  experience: { type: String },
  salary: { type: String },
  applications: { type: Number, default: 0 },
  status: { type: String, default: 'Open', enum: ['Open', 'On-Hold', 'Cancelled', 'Closed'] },
  stage: { type: String, default: 'Manpower Requirement Raised' },
  timestamp: { type: Date, default: Date.now },
  openedOn: { type: String },
  filledOn: { type: String },
  stage_updated_at: { type: Date, default: Date.now },
  stage_history: [stageHistorySchema],
  stage_timestamps: { type: Map, of: stageTimestampSchema, default: {} },
  jd_url: { type: String },
  jd_public_id: { type: String }
}, {
  timestamps: true
});

export const Vacancy = mongoose.models.Vacancy || mongoose.model('Vacancy', vacancySchema);
export default Vacancy;
