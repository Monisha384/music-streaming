import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artistName: { type: String, required: true },
    album: String,
    genre: String,
    audio: { type: String, required: true },
    image: { type: String, required: true },
    duration: String,
    language: String,
    playCount: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Song || mongoose.model("Song", SongSchema);
