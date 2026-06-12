import mongoose from "mongoose";

const ArtistSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    image: String,
    bio: String,
    genre: String,
    followers: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Artist || mongoose.model("Artist", ArtistSchema);
