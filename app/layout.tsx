import "./globals.css";
import AuthGuard from "../component/authguard";
import Navbar from "../component/navbar";
import MiniPlayer from "../component/MiniPlayer";
import SplashScreen from "../component/SplashScreen";
import AdBanner from "../component/AdBanner";
import Sidebar from "../component/Sidebar";
import { PlayerProvider } from "../context/PlayerContext";
import { ThemeProvider } from "../context/ThemeContext";
import { CollaborationProvider } from "../context/CollaborationContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="transition-colors duration-300">
        <SplashScreen />
        <ThemeProvider>
          <PlayerProvider>
            <CollaborationProvider>
              <Sidebar />
              <div className="md:pl-64 transition-all duration-300">
                <Navbar />
                <AuthGuard>
                  <div className="pb-24">{children}</div>
                </AuthGuard>
              </div>
              <AdBanner />
              <MiniPlayer />
            </CollaborationProvider>
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
