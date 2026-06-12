import mongoose from "mongoose";

const UploadRequestSchema = new mongoose.Schema({
    artistName: { type: String, required: true },
    songTitle: { type: String, required: true },
    genre: { type: String, required: true },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

export default mongoose.models.UploadRequest || mongoose.model("UploadRequest", UploadRequestSchema);
