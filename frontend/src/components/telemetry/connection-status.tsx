"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2, Radio, RadioTower, Wifi, WifiOff, XCircle } from "lucide-react";

type ConnectionState = "disconnected" | "connected" | "reconnecting" | "failed";

type Props = {
  connected: boolean;
  connectionState?: ConnectionState;
  dataSource?: "simulated" | "serial" | "udp_broadcast" | null;
  reconnectAttempt?: number;
};

export function ConnectionStatus({ connected, connectionState, dataSource, reconnectAttempt }: Props) {
  if (connectionState === "failed") {
    return (
      <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-sm">
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
        Connection Lost
      </Badge>
    );
  }

  if (connectionState === "reconnecting") {
    return (
      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm bg-status-warning-muted text-status-warning-text">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Reconnecting{reconnectAttempt ? ` (${reconnectAttempt})` : ""}...
      </Badge>
    );
  }

  if (!connected) {
    return (
      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
        <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
        Disconnected
      </Badge>
    );
  }

  if (dataSource === "serial") {
    return (
      <Badge variant="default" className="gap-1.5 px-3 py-1 text-sm bg-status-success hover:bg-status-success-hover animate-racing-glow">
        <Radio className="h-3.5 w-3.5 animate-pulse-live" aria-hidden="true" />
        Live Modem
      </Badge>
    );
  }

  if (dataSource === "udp_broadcast") {
    return (
      <Badge variant="default" className="gap-1.5 px-3 py-1 text-sm bg-status-info hover:bg-status-info-hover animate-racing-glow">
        <RadioTower className="h-3.5 w-3.5 animate-pulse-live" aria-hidden="true" />
        WiFi Broadcast
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1.5 px-3 py-1 text-sm bg-racing hover:bg-racing-hover">
      <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
      Simulated
    </Badge>
  );
}
