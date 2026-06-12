import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/musicdb';

// Simulate exactly what the login API does
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isPremium: { type: Boolean, default: false },
}, { timestamps: true });

async function simulateLogin() {
    await mongoose.connect(MONGODB_URI);
    const User = mongoose.model("TestUser", UserSchema);

    const email = 'admin@melodystream.com';
    const password = 'admin123';

    const user = await User.findOne({ email });
    if (!user) { console.log('User not found!'); process.exit(1); }

    console.log('User from DB via Mongoose:');
    console.log(JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password
    }, null, 2));

    const match = await bcrypt.compare(password, user.password);
    console.log('\nPassword match:', match);

    const response = {
        success: true,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            isPremium: user.isPremium,
            role: user.role || 'user'
        }
    };
    console.log('\nWould return:', JSON.stringify(response, null, 2));

    await mongoose.disconnect();
}

simulateLogin().catch(console.error);
