import mongoose from "mongoose";

const FriendSessionSchema = new mongoose.Schema({
    sessionCode: { type: String, required: true, unique: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.FriendSession || mongoose.model("FriendSession", FriendSessionSchema);
