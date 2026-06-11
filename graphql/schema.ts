export const typeDefs = `
  type Song {
    _id: ID!
    title: String!
    artist: String!
    album: String
    image: String
    audio: String
    language: String
    genre: String
    mood: String
    playCount: Int
    rating: Float
    ratingCount: Int
    downloadable: Boolean
    createdAt: String
  }

  type Artist {
    _id: ID!
    name: String!
    bio: String
    image: String
    language: String
    genre: String
  }

  type Review {
    _id: ID!
    song: ID!
    userEmail: String!
    userName: String!
    rating: Int!
    comment: String
    createdAt: String
  }

  type Notification {
    _id: ID!
    userEmail: String!
    type: String!
    message: String!
    read: Boolean!
    createdAt: String
  }

  type AnalyticsData {
    totalUsers: Int!
    totalSongs: Int!
    totalArtists: Int!
    totalPlaylists: Int!
    totalPlays: Int!
    topSongs: [Song]
    recentSongs: [Song]
    genreBreakdown: [GenreCount]
    languageBreakdown: [LangCount]
  }

  type GenreCount {
    genre: String!
    count: Int!
  }

  type LangCount {
    language: String!
    count: Int!
  }

  type Query {
    songs(search: String, language: String, genre: String, mood: String, sort: String, page: Int, limit: Int): SongPage!
    song(_id: ID!): Song
    artists: [Artist]
    artist(_id: ID!): Artist
    reviews(songId: ID!): [Review]
    notifications(userEmail: String!): [Notification]
    analytics: AnalyticsData
    recommendations(userEmail: String, mood: String, songId: ID): [Song]
  }

  type SongPage {
    songs: [Song]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type Mutation {
    addSong(title: String!, artist: String!, album: String, image: String, audio: String, language: String, genre: String, mood: String, downloadable: Boolean): Song
    updateSong(_id: ID!, title: String, artist: String, album: String, image: String, language: String, genre: String, mood: String, downloadable: Boolean): Song
    deleteSong(_id: ID!): Boolean

    addArtist(name: String!, bio: String, image: String, language: String, genre: String): Artist
    updateArtist(_id: ID!, name: String, bio: String, image: String, language: String, genre: String): Artist
    deleteArtist(_id: ID!): Boolean

    addReview(songId: ID!, userEmail: String!, userName: String!, rating: Int!, comment: String): Review
    markNotificationsRead(userEmail: String!): Boolean
  }
`;
