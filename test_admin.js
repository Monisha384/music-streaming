import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/musicdb';

async function testAdmin() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ email: 'admin@melodystream.com' });
    console.log('Found user:', JSON.stringify({
        email: user.email,
        role: user.role,
        name: user.name,
        passwordHash: user.password.substring(0, 20) + '...'
    }));

    const match = await bcrypt.compare('admin123', user.password);
    console.log('Password match:', match);
    await mongoose.disconnect();
}

testAdmin().catch(console.error);
