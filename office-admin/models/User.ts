import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IUser extends Document {
  sub: string;
  key: string;
  seen: boolean;
  processing: boolean;
  batchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    sub: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    processing: {
      type: Boolean,
      default: false,
    },
    batchId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
