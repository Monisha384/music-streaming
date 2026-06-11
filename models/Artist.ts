import mongoose from "mongoose";

const ArtistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    bio: { type: String, default: "" },
    image: { type: String, default: "" },
    language: { type: String, default: "Other" },
    genre: { type: String, default: "Other" },
  },
  { timestamps: true }
);

export default mongoose.models.Artist || mongoose.model("Artist", ArtistSchema);
