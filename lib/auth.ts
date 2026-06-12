import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string, email: string };
    } catch (error) {
        return null;
    }
}
