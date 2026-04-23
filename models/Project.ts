import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IProject extends Document {
  courseCode: string;
  courseTitle: string;
  courseType: string;
  title: string;
  description: string;
  minMembers: number;
  maxMembers: number;
  requiredFields: string[];
  deadline: Date;
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    courseCode: { type: String, required: true },
    courseTitle: { type: String, required: true },
    courseType: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    minMembers: { type: Number, default: 1 },
    maxMembers: { type: Number, required: true },
    requiredFields: [{ type: String }],
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Project || model<IProject>("Project", ProjectSchema);
