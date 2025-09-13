import { Schema, model, models } from 'mongoose';
import { ModuleSchema } from './module.model';

const CourseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  modules: [ModuleSchema],
});

const Course = models.Course || model('Course', CourseSchema);
export default Course;
