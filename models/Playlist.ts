import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    image: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    isPublic: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Playlist || mongoose.model("Playlist", PlaylistSchema);
