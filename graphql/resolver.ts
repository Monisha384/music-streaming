import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Song from "@/models/Song";
import Playlist from "@/models/Playlist";
import Artist from "@/models/Artist";
import Review from "@/models/Review";

const resolvers = {
  Query: {
    getUser: async (_: any, { email }: { email: string }) => {
      await connectDB();
      return await User.findOne({ email }).populate("playlists").populate("likedSongs");
    },
    getSongs: async (_: any, { sort, search }: { sort?: string; search?: string }) => {
      await connectDB();
      let query: any = {};
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { artistName: { $regex: search, $options: "i" } },
        ];
      }
      let songs = Song.find(query);
      if (sort === "trending") songs = songs.sort({ playCount: -1 });
      if (sort === "recent") songs = songs.sort({ createdAt: -1 });
      return await songs;
    },
    getProfile: async (_: any, { email }: { email: string }) => {
      await connectDB();
      return await User.findOne({ email }).populate({
        path: "recentlyPlayed.song",
        model: "Song"
      });
    },
    getArtists: async () => {
      await connectDB();
      return await Artist.find({});
    },
    getRecommendations: async (_: any, { email }: { email: string }) => {
      await connectDB();
      const user = await User.findOne({ email });
      // Simple logic: return trending songs for now
      return await Song.find({}).sort({ playCount: -1 }).limit(10);
    },
  },
  Mutation: {
    addReview: async (_: any, { userId, songId, rating, comment }: any) => {
      await connectDB();
      const review = await Review.create({ user: userId, song: songId, rating, comment });
      return review;
    },
    playSong: async (_: any, { email, songId }: any) => {
      await connectDB();
      const user = await User.findOne({ email });
      if (user) {
        user.recentlyPlayed.unshift({ song: songId, playedAt: new Date() });
        if (user.recentlyPlayed.length > 20) user.recentlyPlayed.pop();
        await user.save();
      }
      await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });
      return true;
    },
  }
};

export default resolvers;
