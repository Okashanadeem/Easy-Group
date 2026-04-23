import mongoose, { Schema, Document, model, models } from "mongoose";

export interface INotification extends Document {
  recipientId: string;
  senderId: string;
  groupId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  type: "INVITE";
  status: "UNREAD" | "READ" | "RESPONDED";
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: String, required: true },
    senderId: { type: String, required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    type: { type: String, default: "INVITE" },
    status: {
      type: String,
      enum: ["UNREAD", "READ", "RESPONDED"],
      default: "UNREAD",
    },
  },
  { timestamps: true }
);

export default models.Notification ||
  model<INotification>("Notification", NotificationSchema);
