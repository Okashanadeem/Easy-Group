import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IGroupMember {
  studentId: string;
  name: string;
  status: "Pending" | "Accepted" | "Declined";
  joinedAt: Date;
}

export interface IGroup extends Document {
  projectId: mongoose.Types.ObjectId;
  groupName: string;
  leaderId: string;
  members: IGroupMember[];
  attributes: Map<string, string>;
  isSubmitted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    groupName: { type: String, required: true },
    leaderId: { type: String, required: true },
    members: [
      {
        studentId: { type: String, required: true },
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ["Pending", "Accepted", "Declined"],
          default: "Pending",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    attributes: { type: Map, of: String },
    isSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Group || model<IGroup>("Group", GroupSchema);
