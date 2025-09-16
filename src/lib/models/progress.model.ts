import { Schema, model, models } from 'mongoose';

const UserProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Current position in learning path
  currentPhase: { type: Schema.Types.ObjectId, ref: 'Phase' },
  currentWeek: { type: Schema.Types.ObjectId, ref: 'Week' },
  currentLesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  
  // Completed items
  completedPhases: [{
    phaseId: { type: Schema.Types.ObjectId, ref: 'Phase' },
    completedAt: { type: Date, default: Date.now }
  }],
  completedWeeks: [{
    weekId: { type: Schema.Types.ObjectId, ref: 'Week' },
    completedAt: { type: Date, default: Date.now }
  }],
  completedLessons: [{
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
    completedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 }, // in minutes
    pointsEarned: { type: Number, default: 0 }
  }],
  
  // Gamification
  totalPoints: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActivityDate: { type: Date },
  totalTimeSpent: { type: Number, default: 0 }, // in minutes
  
  // Achievements
  achievements: [{
    type: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
    description: { type: String }
  }],
  
  // Legacy support for old course-based structure
  completedResources: [{ type: Schema.Types.ObjectId }],
}, { timestamps: true });

// Indexes for frequent lookups and aggregations
UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ totalPoints: -1, currentStreak: -1 });
UserProgressSchema.index({ currentPhase: 1 });
UserProgressSchema.index({ currentWeek: 1 });
UserProgressSchema.index({ currentLesson: 1 });

const UserProgress = models.UserProgress || model('UserProgress', UserProgressSchema);
export default UserProgress;
