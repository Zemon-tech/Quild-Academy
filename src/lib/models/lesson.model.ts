import { Schema, model, models } from 'mongoose';

const LessonSchema = new Schema({
  weekId: { type: Schema.Types.ObjectId, ref: 'Week', required: true },
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['video', 'workshop', 'project', 'reading', 'quiz', 'assignment'],
    required: true 
  },
  content: {
    duration: { type: Number }, // in minutes
    videoUrl: { type: String },
    readingUrl: { type: String },
    instructions: { type: String },
    resources: [{
      title: { type: String },
      url: { type: String },
      type: { type: String, enum: ['youtube', 'pdf', 'notion', 'link', 'meet'] }
    }]
  },
  points: { type: Number, default: 10 }, // points for completing this lesson
  isActive: { type: Boolean, default: true },
  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  order: { type: Number, required: true }, // order within the week
}, { timestamps: true });

// Indexes to speed up lesson queries
LessonSchema.index({ weekId: 1, isActive: 1, order: 1 });
LessonSchema.index({ isActive: 1, order: 1 });

const Lesson = models.Lesson || model('Lesson', LessonSchema);
export default Lesson;

