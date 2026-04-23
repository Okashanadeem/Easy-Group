import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICamsStudent extends Document {
  studentId: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: {
    courseCode: string;
    courseTitle: string;
    courseType: string;
  }[];
  syncedAt: Date;
}

const CamsStudentSchema = new Schema<ICamsStudent>(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    enrolledCourses: [
      {
        courseCode: String,
        courseTitle: String,
        courseType: String,
      },
    ],
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface ICamsCourse extends Document {
  courseCode: string;
  courseTitle: string;
  courseType: string;
  isActive: boolean;
  syncedAt: Date;
}

const CamsCourseSchema = new Schema<ICamsCourse>(
  {
    courseCode: { type: String, required: true },
    courseTitle: { type: String, required: true },
    courseType: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CamsCourseSchema.index({ courseCode: 1, courseType: 1 }, { unique: true });

export const CamsStudent =
  models.CamsStudent || model<ICamsStudent>("CamsStudent", CamsStudentSchema);
export const CamsCourse =
  models.CamsCourse || model<ICamsCourse>("CamsCourse", CamsCourseSchema);
