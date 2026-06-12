import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

interface SocketServer extends HTTPServer {
    io?: Server | undefined;
}

interface SocketWithIO extends NetSocket {
    server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO;
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (res.socket.server.io) {
        console.log("Socket is already running");
    } else {
        console.log("Socket is initializing");
        const io = new Server(res.socket.server as any, {
            path: "/api/socket",
        });
        res.socket.server.io = io;

        io.on("connection", (socket) => {
            socket.on("join-room", (roomCode) => {
                socket.join(roomCode);
                console.log(`User joined room: ${roomCode}`);
            });

            socket.on("playback-state", ({ roomCode, state }) => {
                socket.to(roomCode).emit("playback-update", state);
            });

            socket.on("sync-request", (roomCode) => {
                socket.to(roomCode).emit("request-state");
            });
        });
    }
    res.end();
}
