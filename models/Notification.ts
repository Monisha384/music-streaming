import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    type: { type: String, enum: ["new_song", "new_artist_song", "general"], default: "general" },
    message: { type: String, required: true },
    songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song", default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
