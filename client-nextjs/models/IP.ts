
import mongoose, { Schema, models, model } from "mongoose";

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ipSchema = new Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    city: String,
    region: String,
    country: String,
    latitude: Number,
    longitude: Number,
    isp: String,

    accessCount: {
      type: Number,
      default: 1,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },

    // Device and contact information
    deviceModel: String,
    osVersion: String,
    email: String,
    phoneNumber: String,

    // Encryption card images
    encryptionCardImages: {
      type: [imageSchema],
      default: [],
    },

    // Receipt images
    receiptImages: {
      type: [imageSchema],
      default: [],
    },

    encryptionRequestDate: Date,

    encryptionStatus: {
      type: String,
      enum: ["unapproved", "pending", "approved", "rejected"],
      default: "unapproved",
    },

    encryptionNotes: String,
  },
  {
    timestamps: true,
  }
);

const IP = models.IP || model("IP", ipSchema);

export default IP;
