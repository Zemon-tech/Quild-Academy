import { Schema, model, models } from 'mongoose';

const WeekSchema = new Schema({
  phaseId: { type: Schema.Types.ObjectId, ref: 'Phase', required: true },
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  estimatedDuration: { type: Number }, // in days
  objectives: [String], // learning objectives for the week
}, { timestamps: true });

const Week = models.Week || model('Week', WeekSchema);
export default Week;

