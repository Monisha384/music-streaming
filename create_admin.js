import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/musicdb';

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        if (!db) throw new Error("DB connection failed");

        const email = 'admin@melodystream.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.collection('users').updateOne(
            { email },
            {
                $set: {
                    email,
                    password: hashedPassword,
                    name: 'Admin',
                    role: 'admin',
                    updatedAt: new Date()
                },
                $setOnInsert: { createdAt: new Date() }
            },
            { upsert: true }
        );

        console.log(`Admin user ${result.upsertedCount > 0 ? 'created' : 'updated'}: ${email}`);
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

createAdmin();
