import { Schema, model, models } from 'mongoose';

const UserProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedResources: [{ type: Schema.Types.ObjectId }],
});

const UserProgress = models.UserProgress || model('UserProgress', UserProgressSchema);
export default UserProgress;
