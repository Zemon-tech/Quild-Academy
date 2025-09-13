import { Schema } from 'mongoose';
import { ResourceSchema } from './resource.model';

export const ModuleSchema = new Schema({
  title: { type: String, required: true },
  resources: [ResourceSchema],
});
