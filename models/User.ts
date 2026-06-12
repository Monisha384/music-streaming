import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isPremium: { type: Boolean, default: false },
    settings: {
        theme: { type: String, default: "dark" },
        notifications: { type: Boolean, default: true },
        autoplay: { type: Boolean, default: true },
    },
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Playlist" }],
    recentlyPlayed: [{
        song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
        playedAt: { type: Date, default: Date.now }
    }],
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
}, { timestamps: true });

// NOTE: Using safe caching pattern for Next.js hot-reloads
// Delete cached model to force schema update with the new `role` field
if (mongoose.models.User) {
    // Only delete if re-defined to pick up `role` field changes
    delete mongoose.models.User;
}
export default mongoose.model("User", UserSchema);
