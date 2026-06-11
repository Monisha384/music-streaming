import "./globals.css";
import AuthGuard from "../component/authguard";
import Navbar from "../component/navbar";
import MiniPlayer from "../component/MiniPlayer";
import { PlayerProvider } from "../context/PlayerContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="transition-colors duration-300">
        <ThemeProvider>
          <PlayerProvider>
            <Navbar />
            <AuthGuard>
              <div className="pb-24">{children}</div>
            </AuthGuard>
            <MiniPlayer />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
