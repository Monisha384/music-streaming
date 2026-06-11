import Song from "@/models/Song";
import Artist from "@/models/Artist";
import Review from "@/models/Review";
import Notification from "@/models/Notification";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

const MOOD_GENRE_MAP: Record<string, string[]> = {
  happy: ["Pop", "Folk", "Mass"],
  sad: ["Melody", "Romantic", "Classical"],
  relax: ["Classical", "Melody", "Romantic"],
  workout: ["Mass", "Rock", "Pop"],
  party: ["Pop", "Mass", "Folk"],
  romantic: ["Romantic", "Melody", "Classical"],
};

const resolvers = {
  Query: {
    songs: async (_: unknown, { search = "", language = "", genre = "", mood = "", sort = "recent", page = 1, limit = 12 }: {
      search?: string; language?: string; genre?: string; mood?: string; sort?: string; page?: number; limit?: number;
    }) => {
      await connectDB();
      const query: Record<string, unknown> = {};
      if (search) query.$or = [{ title: { $regex: search, $options: "i" } }, { artist: { $regex: search, $options: "i" } }, { album: { $regex: search, $options: "i" } }];
      if (language) query.language = language;
      if (genre) query.genre = genre;
      if (mood && MOOD_GENRE_MAP[mood.toLowerCase()]) query.genre = { $in: MOOD_GENRE_MAP[mood.toLowerCase()] };

      const sortMap: Record<string, Record<string, number>> = {
        recent: { createdAt: -1 },
        trending: { playCount: -1 },
        topRated: { rating: -1 },
      };

      const total = await Song.countDocuments(query);
      const songs = await Song.find(query)
        .sort(sortMap[sort] ?? { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return { songs, total, page, totalPages: Math.ceil(total / limit) };
    },

    song: async (_: unknown, { _id }: { _id: string }) => {
      await connectDB();
      return await Song.findById(_id);
    },

    artists: async () => {
      await connectDB();
      return await Artist.find().sort({ name: 1 });
    },

    artist: async (_: unknown, { _id }: { _id: string }) => {
      await connectDB();
      return await Artist.findById(_id);
    },

    reviews: async (_: unknown, { songId }: { songId: string }) => {
      await connectDB();
      return await Review.find({ song: songId }).sort({ createdAt: -1 });
    },

    notifications: async (_: unknown, { userEmail }: { userEmail: string }) => {
      await connectDB();
      return await Notification.find({ userEmail }).sort({ createdAt: -1 }).limit(20);
    },

    analytics: async () => {
      await connectDB();
      const [totalUsers, totalSongs, totalArtists, allSongs] = await Promise.all([
        User.countDocuments(),
        Song.countDocuments(),
        Artist.countDocuments(),
        Song.find().select("playCount genre language"),
      ]);

      const users = await User.find().select("playlists");
      const totalPlaylists = users.reduce((acc, u) => acc + (u.playlists?.length ?? 0), 0);
      const totalPlays = allSongs.reduce((acc, s) => acc + (s.playCount ?? 0), 0);

      const genreMap: Record<string, number> = {};
      const langMap: Record<string, number> = {};
      allSongs.forEach((s) => {
        if (s.genre) genreMap[s.genre] = (genreMap[s.genre] ?? 0) + 1;
        if (s.language) langMap[s.language] = (langMap[s.language] ?? 0) + 1;
      });

      const genreBreakdown = Object.entries(genreMap).map(([genre, count]) => ({ genre, count }));
      const languageBreakdown = Object.entries(langMap).map(([language, count]) => ({ language, count }));

      const topSongs = await Song.find().sort({ playCount: -1 }).limit(5);
      const recentSongs = await Song.find().sort({ createdAt: -1 }).limit(5);

      return { totalUsers, totalSongs, totalArtists, totalPlaylists, totalPlays, topSongs, recentSongs, genreBreakdown, languageBreakdown };
    },

    recommendations: async (_: unknown, { userEmail, mood, songId }: { userEmail?: string; mood?: string; songId?: string }) => {
      await connectDB();

      // Mood-based
      if (mood && MOOD_GENRE_MAP[mood.toLowerCase()]) {
        return await Song.find({ genre: { $in: MOOD_GENRE_MAP[mood.toLowerCase()] } }).sort({ playCount: -1 }).limit(8);
      }

      // Similar song based
      if (songId) {
        const song = await Song.findById(songId);
        if (song) {
          return await Song.find({ _id: { $ne: songId }, $or: [{ artist: song.artist }, { genre: song.genre }] }).sort({ playCount: -1 }).limit(8);
        }
      }

      // User history-based
      if (userEmail) {
        const user = await User.findOne({ email: userEmail }).populate("recentlyPlayed.song");
        if (user?.recentlyPlayed?.length) {
          const recentSongs = user.recentlyPlayed.slice(-10).map((r: { song: { genre?: string; artist?: string } }) => r.song).filter(Boolean);
          const genres = [...new Set(recentSongs.map((s: { genre?: string }) => s?.genre).filter(Boolean))];
          const artists = [...new Set(recentSongs.map((s: { artist?: string }) => s?.artist).filter(Boolean))];
          const playedIds = user.recentlyPlayed.map((r: { song: { _id: string } }) => r.song?._id);
          return await Song.find({ _id: { $nin: playedIds }, $or: [{ genre: { $in: genres } }, { artist: { $in: artists } }] }).sort({ playCount: -1 }).limit(8);
        }
      }

      return await Song.find().sort({ playCount: -1 }).limit(8);
    },
  },

  Mutation: {
    addSong: async (_: unknown, args: Record<string, unknown>) => {
      await connectDB();
      const song = await Song.create(args);
      // Notify all users
      const users = await User.find().select("email");
      await Notification.insertMany(users.map((u) => ({
        userEmail: u.email,
        type: "new_song",
        message: `New song added: "${args.title}" by ${args.artist}`,
        songId: song._id,
      })));
      return song;
    },

    updateSong: async (_: unknown, { _id, ...args }: Record<string, unknown>) => {
      await connectDB();
      return await Song.findByIdAndUpdate(_id, args, { new: true });
    },

    deleteSong: async (_: unknown, { _id }: { _id: string }) => {
      await connectDB();
      await Song.findByIdAndDelete(_id);
      return true;
    },

    addArtist: async (_: unknown, args: Record<string, unknown>) => {
      await connectDB();
      return await Artist.create(args);
    },

    updateArtist: async (_: unknown, { _id, ...args }: Record<string, unknown>) => {
      await connectDB();
      return await Artist.findByIdAndUpdate(_id, args, { new: true });
    },

    deleteArtist: async (_: unknown, { _id }: { _id: string }) => {
      await connectDB();
      await Artist.findByIdAndDelete(_id);
      return true;
    },

    addReview: async (_: unknown, { songId, userEmail, userName, rating, comment }: {
      songId: string; userEmail: string; userName: string; rating: number; comment?: string;
    }) => {
      await connectDB();
      const existing = await Review.findOne({ song: songId, userEmail });
      let review;
      if (existing) {
        existing.rating = rating;
        existing.comment = comment ?? "";
        review = await existing.save();
      } else {
        review = await Review.create({ song: songId, userEmail, userName, rating, comment });
      }
      // Update song average rating
      const reviews = await Review.find({ song: songId });
      const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
      await Song.findByIdAndUpdate(songId, { rating: avg, ratingCount: reviews.length });
      return review;
    },

    markNotificationsRead: async (_: unknown, { userEmail }: { userEmail: string }) => {
      await connectDB();
      await Notification.updateMany({ userEmail }, { read: true });
      return true;
    },
  },
};

export default resolvers;
