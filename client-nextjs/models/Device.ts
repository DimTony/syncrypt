import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ENCRYPTION_STATUSES = ["pending", "rejected", "verified"] as const;
export type EncryptionStatus = (typeof ENCRYPTION_STATUSES)[number];

const DeviceSchema = new Schema(
  {
    ip: { type: String, required: true, unique: true, index: true },
    encryptionStatus: {
      type: String,
      enum: ENCRYPTION_STATUSES,
      default: "pending",
    },
  },
  { timestamps: true },
);

export type DeviceDoc = InferSchemaType<typeof DeviceSchema>;

// If you're migrating existing data, pass your current collection name as the
// third argument, e.g. model("Device", DeviceSchema, "encryptions")
export const Device: Model<DeviceDoc> =
  (models.Device as Model<DeviceDoc>) || model<DeviceDoc>("Device", DeviceSchema);
