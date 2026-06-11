import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    favoriteArtists: [{ type: String }],
    playlists: [PlaylistSchema],
    recentlyPlayed: [
      {
        song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
        playedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
