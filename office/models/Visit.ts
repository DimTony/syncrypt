import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IVisitLocation {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

export interface IVisit extends Document {
  page: string;
  userAgent?: string;
  referrer?: string;
  ipAddress?: string;
  location?: IVisitLocation;
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    page: {
      type: String,
      required: true,
    },
    userAgent: String,
    referrer: String,
    ipAddress: String,
    location: {
      country: String,
      countryCode: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number,
      timezone: String,
      isp: String,
    },
  },
  {
    timestamps: true,
  }
);

const Visit =
  models.Visit || model<IVisit>("Visit", VisitSchema);

export default Visit;