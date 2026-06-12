"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePlayer } from "./PlayerContext";
import io, { Socket } from "socket.io-client";

interface CollaborationContextType {
    roomCode: string | null;
    role: "host" | "guest" | null;
    createRoom: (type: "friend" | "couple") => Promise<string>;
    joinRoom: (code: string) => Promise<boolean>;
    leaveRoom: () => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [role, setRole] = useState<"host" | "guest" | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const { currentSong, isPlaying, currentTime, playSong, togglePlay, setCurrentTime } = usePlayer();

    useEffect(() => {
        // Initializing socket
        fetch("/api/socket").finally(() => {
            const socket = io({ path: "/api/socket" });
            socketRef.current = socket;

            socket.on("playback-update", (state: any) => {
                if (role === "guest") {
                    // Sync guest to host
                    if (state.songId !== currentSong?._id) {
                        // Need a way to fetch song if changed. (Simulation: assume same library)
                    }
                    if (state.isPlaying !== isPlaying) togglePlay();
                    if (Math.abs(state.currentTime - currentTime) > 2) setCurrentTime(state.currentTime);
                }
            });

            socket.on("request-state", () => {
                if (role === "host") {
                    socket.emit("playback-state", {
                        roomCode,
                        state: { songId: currentSong?._id, isPlaying, currentTime },
                    });
                }
            });
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [role, roomCode]);

    // Sync host state to guest
    useEffect(() => {
        if (role === "host" && socketRef.current && roomCode) {
            socketRef.current.emit("playback-state", {
                roomCode,
                state: { songId: currentSong?._id, isPlaying, currentTime },
            });
        }
    }, [isPlaying, currentSong, roomCode]);

    const createRoom = async (type: "friend" | "couple") => {
        const userStr = localStorage.getItem("melodystream-user-info");
        const user = userStr ? JSON.parse(userStr) : {};
        const res = await fetch("/api/auth/collaboration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, userId: user.id }),
        });
        const data = await res.json();
        if (data.success) {
            setRoomCode(data.code);
            setRole("host");
            socketRef.current?.emit("join-room", data.code);
            return data.code;
        }
        return "";
    };

    const joinRoom = async (code: string) => {
        const userStr = localStorage.getItem("melodystream-user-info");
        const user = userStr ? JSON.parse(userStr) : {};
        const res = await fetch("/api/auth/collaboration", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, userId: user.id }),
        });
        const data = await res.json();
        if (data.success) {
            setRoomCode(code);
            setRole("guest");
            socketRef.current?.emit("join-room", code);
            socketRef.current?.emit("sync-request", code);
            return true;
        }
        return false;
    };

    const leaveRoom = () => {
        setRoomCode(null);
        setRole(null);
        socketRef.current?.emit("leave-room", roomCode);
    };

    return (
        <CollaborationContext.Provider value={{ roomCode, role, createRoom, joinRoom, leaveRoom }}>
            {children}
        </CollaborationContext.Provider>
    );
}

export function useCollaboration() {
    const ctx = useContext(CollaborationContext);
    if (!ctx) throw new Error("useCollaboration must be used within CollaborationProvider");
    return ctx;
}
