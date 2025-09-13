import { Schema } from 'mongoose';

export const ResourceSchema = new Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['youtube', 'pdf', 'notion', 'link', 'meet'],
    required: true
  },
  url: { type: String, required: true },
});
