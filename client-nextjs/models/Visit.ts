import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const VisitSchema = new Schema(
  {
    ip: { type: String, default: null, index: true },
    userAgent: { type: String, default: null },
  },
  { timestamps: true },
);

export type VisitDoc = InferSchemaType<typeof VisitSchema>;

export const Visit: Model<VisitDoc> =
  (models.Visit as Model<VisitDoc>) || model<VisitDoc>("Visit", VisitSchema);
