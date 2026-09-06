import { WifiOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline | Orbbion Inspect",
};

export default function OfflinePage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">You are offline</h1>
          <p className="text-muted-foreground max-w-sm">
            It looks like you've lost your internet connection. We'll automatically reconnect when your network comes back.
          </p>
        </div>
      </div>
    </div>
  );
}
