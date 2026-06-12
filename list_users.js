import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/musicdb';

async function listUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        if (!db) throw new Error("DB connection failed");
        const users = await db.collection('users').find({}).toArray();
        console.log(JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

listUsers();
