import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ENCRYPTION_ACTIONS = ["encrypt", "decrypt"] as const;
export type EncryptionAction = (typeof ENCRYPTION_ACTIONS)[number];

const encryptionLogSchema = new Schema(
  {
    action: String,
    key: String,
    ip: String
  },
  {
    timestamps: true,
  }
);

const EncryptionLog = models.EncryptionLog || model("EncryptionLog", encryptionLogSchema);

export default EncryptionLog;
