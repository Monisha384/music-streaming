import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/musicdb';

async function listCollections() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        if (!db) throw new Error("DB connection failed");
        const collections = await db.listCollections().toArray();
        console.log(JSON.stringify(collections.map(c => c.name), null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

listCollections();
