import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IAdmin extends Document {
  secret: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    secret: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);

export default Admin;
