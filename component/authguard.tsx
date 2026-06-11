"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useSyncExternalStore } from "react";

const openRoutes = ["/login", "/register"];

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getUserAccess() {
  return localStorage.getItem("musicverse-user") === "true";
}

function getAdminAccess() {
  return localStorage.getItem("musicverse-admin") === "true";
}

function getBrowserReady() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isOpenRoute = openRoutes.includes(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const browserReady = useSyncExternalStore(subscribeToStorage, getBrowserReady, getServerSnapshot);
  const hasUserAccess = useSyncExternalStore(subscribeToStorage, getUserAccess, getServerSnapshot);
  const hasAdminAccess = useSyncExternalStore(subscribeToStorage, getAdminAccess, getServerSnapshot);

  useEffect(() => {
    if (!browserReady || isOpenRoute) {
      return;
    }

    if (isAdminRoute && !hasAdminAccess) {
      router.replace("/login");
      return;
    }

    if (!isAdminRoute && !hasUserAccess) {
      router.replace("/login");
    }
  }, [browserReady, hasAdminAccess, hasUserAccess, isAdminRoute, isOpenRoute, router]);

  if (isOpenRoute) {
    return children;
  }

  if (isAdminRoute && (!browserReady || !hasAdminAccess)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Please login as admin to continue...</p>
      </main>
    );
  }

  if (!isAdminRoute && (!browserReady || !hasUserAccess)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Please login to continue...</p>
      </main>
    );
  }

  return children;
}
