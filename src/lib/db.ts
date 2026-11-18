import mongoose, { Schema, model, models } from "mongoose";

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME ?? "paper-explainer";

export async function connectDatabase() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(mongoUri, {
    dbName: databaseName,
    serverSelectionTimeoutMS: 5000,
  });
}

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  profession: { type: String, default: null },
}, { timestamps: true });

const paperSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  fileName: { type: String, required: true },
  pageCount: { type: Number, default: 0 },
  summary: { type: String, default: "" },
  highlights: { type: [String], default: [] },
  keywords: { type: [String], default: [] },
  sectionSummaries: { type: Schema.Types.Mixed, default: [] },
  reportSections: { type: Schema.Types.Mixed, default: [] },
  corpus: { type: [String], default: [] },
  visualPages: { type: [Schema.Types.Mixed], default: [] },
  blobName: { type: String, default: null },
  blobContainer: { type: String, default: null },
}, { timestamps: true });

const chatMessageSchema = new Schema({
  paperId: { type: Schema.Types.ObjectId, ref: "Paper", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, required: true },
  sources: { type: [String], default: [] },
}, { timestamps: true });

export const User = models.User ?? model("User", userSchema);
export const Paper = models.Paper ?? model("Paper", paperSchema);
export const ChatMessage = models.ChatMessage ?? model("ChatMessage", chatMessageSchema);
