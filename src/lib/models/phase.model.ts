import { Schema, model, models } from 'mongoose';

const PhaseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  estimatedDuration: { type: Number }, // in days
  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Phase' }],
  color: { type: String, default: '#3B82F6' }, // for UI theming
}, { timestamps: true });

// Indexes to speed up common queries and sorts
PhaseSchema.index({ isActive: 1, order: 1 });
PhaseSchema.index({ order: 1 });

const Phase = models.Phase || model('Phase', PhaseSchema);
export default Phase;
