import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

ReviewSchema.index({ song: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
