import type {
  WsEnquiryClientAction,
  WsServerEvent,
  WsTradeClientAction,
} from "@/types/bidding";

// ─── Base WS URL Resolution ───────────────────────────────────────────────────

/**
 * Derives the WebSocket host from environment variables.
 * Converts an http/https API URL to ws/wss automatically.
 */
function getBiddingWsBase(): string {
  const configured =
    process.env.NEXT_PUBLIC_BIDDING_WS_URL ??
    process.env.NEXT_PUBLIC_BIDDING_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:82";

  // Strip any trailing /api/bidding path segment — WS paths are separate.
  const base = configured.replace(/\/api\/bidding\/?$/, "").replace(/\/api\/?$/, "");

  return base
    .replace(/^https:\/\//, "wss://")
    .replace(/^http:\/\//, "ws://");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type WsConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

type WsEventListener = (event: WsServerEvent) => void;
type WsStatusListener = (status: WsConnectionStatus) => void;

// ─── BiddingRoomSocket ────────────────────────────────────────────────────────

/**
 * Manages a single WebSocket connection to a bidding room (enquiry or trade).
 *
 * Usage:
 * ```ts
 * const socket = createBiddingRoomSocket();
 *
 * const unsubEvent  = socket.onEvent(handleServerEvent);
 * const unsubStatus = socket.onStatusChange(setStatus);
 *
 * socket.connectToEnquiryRoom(enquiryId, token);
 *
 * // Send an action:
 * socket.sendEnquiryAction({ action: "send_message", body: "Hello" });
 *
 * // Clean up:
 * socket.disconnect();
 * unsubEvent();
 * unsubStatus();
 * ```
 */
export class BiddingRoomSocket {
  private ws: WebSocket | null = null;
  private activeUrl: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;

  private readonly eventListeners = new Set<WsEventListener>();
  private readonly statusListeners = new Set<WsStatusListener>();

  // ── Connection ─────────────────────────────────────────────────────────────

  /** Opens a WebSocket to the enquiry room for the given enquiry ID. */
  connectToEnquiryRoom(enquiryId: string, token: string): this {
    const url = `${getBiddingWsBase()}/ws/bidding/enquiries/${enquiryId}/?token=${token}`;
    this.open(url);
    return this;
  }

  /** Opens a WebSocket to the trade room for the given trade ID. */
  connectToTradeRoom(tradeId: string, token: string): this {
    const url = `${getBiddingWsBase()}/ws/bidding/trades/${tradeId}/?token=${token}`;
    this.open(url);
    return this;
  }

  /** Closes the socket and prevents any future reconnect attempts. */
  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.activeUrl = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get status(): WsConnectionStatus {
    if (!this.ws) return "idle";
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "idle";
    }
  }

  // ── Sending ────────────────────────────────────────────────────────────────

  /** Sends a typed enquiry room action. No-ops if the socket is not open. */
  sendEnquiryAction(action: WsEnquiryClientAction): void {
    this.sendRaw(action);
  }

  /** Sends a typed trade room action. No-ops if the socket is not open. */
  sendTradeAction(action: WsTradeClientAction): void {
    this.sendRaw(action);
  }

  /** Low-level send — serialises any object to JSON. No-ops if not connected. */
  sendRaw(payload: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  // ── Subscriptions ──────────────────────────────────────────────────────────

  /**
   * Subscribes to server-sent events. Returns an unsubscribe function.
   *
   * ```ts
   * const unsub = socket.onEvent((event) => { ... });
   * // later:
   * unsub();
   * ```
   */
  onEvent(listener: WsEventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  /**
   * Subscribes to connection status changes. Returns an unsubscribe function.
   */
  onStatusChange(listener: WsStatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private open(url: string): void {
    // Close any existing connection before opening a new one.
    if (this.ws) {
      this.shouldReconnect = false;
      this.ws.close();
    }

    this.activeUrl = url;
    this.shouldReconnect = true;
    this.createWebSocket(url);
  }

  private createWebSocket(url: string): void {
    this.ws = new WebSocket(url);
    this.emitStatus("connecting");

    this.ws.onopen = () => {
      this.emitStatus("connected");
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as WsServerEvent;
        this.eventListeners.forEach((listener) => listener(data));
      } catch {
        // Ignore non-JSON frames.
      }
    };

    this.ws.onerror = () => {
      this.emitStatus("error");
    };

    this.ws.onclose = (event) => {
      this.emitStatus("disconnected");

      // 4401 = Unauthorized, 4403 = Forbidden — do not reconnect.
      const permanent = event.code === 4401 || event.code === 4403;

      if (this.shouldReconnect && !permanent && this.activeUrl) {
        this.reconnectTimer = setTimeout(() => {
          if (this.activeUrl) this.createWebSocket(this.activeUrl);
        }, 3_000);
      }
    };
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private emitStatus(status: WsConnectionStatus): void {
    this.statusListeners.forEach((listener) => listener(status));
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/** Creates a fresh, disconnected `BiddingRoomSocket` instance. */
export function createBiddingRoomSocket(): BiddingRoomSocket {
  return new BiddingRoomSocket();
}
