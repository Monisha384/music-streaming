import mongoose from "mongoose";

const SongSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, default: "" },
    image: { type: String, default: "" },
    audio: { type: String, default: "" },
    language: { type: String, default: "Other" },
    genre: { type: String, default: "Other" },
    mood: { type: String, default: "" },
    playCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    downloadable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Song || mongoose.model("Song", SongSchema);
