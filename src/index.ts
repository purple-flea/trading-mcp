#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.TRADING_API_URL || "http://localhost:3003";
const API_KEY = process.env.TRADING_API_KEY || "";

async function api(method: string, path: string, body?: unknown) {
  const url = `${BASE_URL}/v1${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_KEY) {
    headers["Authorization"] = `Bearer ${API_KEY}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  try {
    return await res.json();
  } catch {
    return { error: "invalid_response", message: `Server returned non-JSON (HTTP ${res.status})` };
  }
}

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function result(data: unknown) {
  const hasError = typeof data === "object" && data !== null && "error" in data;
  return { ...text(data), isError: hasError };
}

const server = new McpServer({
  name: "purple-flea-trading",
  version: "1.0.0",
});

// ─── register ───────────────────────────────────────────────────────────────

server.tool(
  "register",
  "Create a Purple Flea Trading account for access to 275+ perpetual markets on Hyperliquid — the most liquid DEX, rivalling Binance in order book depth. Returns an API key for authenticated trading across stocks (TSLA, NVDA, AAPL, GOOGL), commodities (GOLD, SILVER, OIL), crypto (229 perps including BTC, ETH, SOL), forex, and indices. Optionally provide a referral code — referring agents earn 20% commission on fee markup from traders they refer.",
  {
    referral_code: z
      .string()
      .optional()
      .describe("Referral code from another agent (e.g. ref_a1b2c3d4). The referrer earns 20% commission on your trading fee markup."),
    wallet_agent_id: z
      .string()
      .optional()
      .describe("Link to an existing wallet agent ID for unified identity across Purple Flea services."),
  },
  async ({ referral_code, wallet_agent_id }) => {
    const data = await api("POST", "/auth/register", { referral_code, wallet_agent_id });
    return text(data);
  },
);

// ─── list_markets ───────────────────────────────────────────────────────────

server.tool(
  "list_markets",
  "Browse all 275+ perpetual markets available on Hyperliquid — the highest-liquidity decentralised exchange. Categories: stocks (TSLA, NVDA, AAPL, GOOGL, META, AMD — 29 equities tradeable 24/7), commodities (GOLD, SILVER, OIL, URANIUM, COPPER — 9 markets), indices (SPX, JP225, DXY — 7 markets), forex (EUR, JPY), and 229 crypto perpetuals (BTC, ETH, SOL, XRP, DOGE and more). All with deep liquidity and tight spreads via Hyperliquid's on-chain order book.",
  {
    category: z
      .enum(["all", "stocks", "commodities", "indices", "forex", "crypto", "rwa"])
      .optional()
      .default("all")
      .describe("Filter by asset category. 'rwa' returns all non-crypto markets (stocks + commodities + indices + forex). Default: all."),
  },
  async ({ category }) => {
    const path = category === "all"
      ? "/markets"
      : category === "rwa"
        ? "/markets/rwa"
        : `/markets/${category}`;
    const data = await api("GET", path);
    return text(data);
  },
);

// ─── market_price ───────────────────────────────────────────────────────────

server.tool(
  "market_price",
  "Get the real-time price for any of 275+ markets. Prices sourced directly from Hyperliquid's on-chain order book — the deepest liquidity of any DEX. Supports stocks (TSLA, NVDA), commodities (GOLD, SILVER), crypto (BTC, ETH, SOL), forex (EUR, JPY), and indices (SPX).",
  {
    coin: z
      .string()
      .describe("Market ticker — e.g. TSLA, NVDA, GOLD, SILVER, BTC, ETH, SOL, XRP, EUR, SPX. Case-insensitive."),
  },
  async ({ coin }) => {
    const data = await api("GET", `/markets/${encodeURIComponent(coin.toUpperCase())}/price`);
    return result(data);
  },
);

// ─── open_position ──────────────────────────────────────────────────────────

server.tool(
  "open_position",
  "Open a leveraged long or short position on any of 275+ perpetual markets via Hyperliquid. Stocks up to 5x (TSLA, NVDA, AAPL), commodities up to 10x (GOLD, SILVER), crypto up to 50x (BTC, ETH, SOL). Execution fills against Hyperliquid's deep on-chain order book — liquidity rivalling centralised exchanges. Fee: Hyperliquid base fee + small markup (as low as 0 bps on whale tier). Returns position ID, entry price, margin used, and liquidation price.",
  {
    coin: z
      .string()
      .describe("Market ticker — e.g. TSLA, NVDA, GOLD, SILVER, BTC, ETH, SOL. Case-insensitive."),
    side: z
      .enum(["long", "short"])
      .describe("Position direction. 'long' profits when price rises, 'short' profits when price falls."),
    size_usd: z
      .number()
      .positive()
      .describe("Position size in USD. Example: 1000 = $1,000 notional exposure."),
    leverage: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .default(5)
      .describe("Leverage multiplier (1–50x depending on market and tier). Default 5x. Higher leverage = higher risk and reward."),
  },
  async ({ coin, side, size_usd, leverage }) => {
    const data = await api("POST", "/trade/open", { coin, side, size_usd, leverage });
    return result(data);
  },
);

// ─── close_position ─────────────────────────────────────────────────────────

server.tool(
  "close_position",
  "Close an open position at the current market price to realize profit or loss. Returns entry price, exit price, P&L in USD and percentage, and fees. Execution via Hyperliquid's deep liquidity pool.",
  {
    position_id: z
      .string()
      .describe("Position ID to close (e.g. pos_a1b2c3d4). Get IDs from the positions tool."),
  },
  async ({ position_id }) => {
    const data = await api("POST", "/trade/close", { position_id });
    return result(data);
  },
);

// ─── set_stop_loss ──────────────────────────────────────────────────────────

server.tool(
  "set_stop_loss",
  "Set a stop-loss order on an open position to limit downside risk. When the market price reaches the stop price, the position is automatically closed. Essential risk management for leveraged trading on Hyperliquid's volatile markets.",
  {
    position_id: z
      .string()
      .describe("Position ID to attach the stop-loss to (e.g. pos_a1b2c3d4)."),
    stop_price: z
      .number()
      .positive()
      .describe("Price at which to trigger the stop-loss. For longs: set below entry price. For shorts: set above entry price."),
  },
  async ({ position_id, stop_price }) => {
    const data = await api("POST", "/trade/stop-loss", { position_id, stop_price });
    return result(data);
  },
);

// ─── set_take_profit ────────────────────────────────────────────────────────

server.tool(
  "set_take_profit",
  "Set a take-profit order on an open position to lock in gains automatically. When the market price reaches the target, the position is closed at profit. Combine with stop-loss for a complete risk/reward strategy on Hyperliquid markets.",
  {
    position_id: z
      .string()
      .describe("Position ID to attach the take-profit to (e.g. pos_a1b2c3d4)."),
    take_profit_price: z
      .number()
      .positive()
      .describe("Price at which to trigger the take-profit. For longs: set above entry price. For shorts: set below entry price."),
  },
  async ({ position_id, take_profit_price }) => {
    const data = await api("POST", "/trade/take-profit", { position_id, take_profit_price });
    return result(data);
  },
);

// ─── positions ──────────────────────────────────────────────────────────────

server.tool(
  "positions",
  "View your open trading positions with live prices and unrealized P&L from Hyperliquid. Shows entry price, current price, leverage, margin, liquidation price, and real-time profit/loss for each position across all 275+ markets (stocks, crypto, commodities, forex, indices).",
  {
    status: z
      .enum(["open", "all"])
      .optional()
      .default("open")
      .describe("'open' for active positions only (default). 'all' includes closed and liquidated positions (last 50)."),
  },
  async ({ status }) => {
    const path = status === "all" ? "/trade/positions?status=all" : "/trade/positions";
    const data = await api("GET", path);
    return text(data);
  },
);

// ─── orders ─────────────────────────────────────────────────────────────────

server.tool(
  "orders",
  "View your pending and filled orders including market orders, limit orders, stop-loss, and take-profit orders. Shows order status, fill price, fees, and linked positions.",
  {
    status: z
      .enum(["all", "pending", "filled", "cancelled"])
      .optional()
      .default("all")
      .describe("Filter orders by status. Default: all."),
    limit: z
      .number()
      .min(1)
      .max(200)
      .optional()
      .default(50)
      .describe("Number of orders to return (default 50, max 200)."),
  },
  async ({ status, limit }) => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    params.set("limit", String(limit));
    const query = params.toString();
    const data = await api("GET", `/trade/orders${query ? `?${query}` : ""}`);
    return text(data);
  },
);

// ─── trade_history ──────────────────────────────────────────────────────────

server.tool(
  "trade_history",
  "View your complete trade execution history — every fill with exact prices, fees paid (Hyperliquid base + Purple Flea markup), and realized P&L. Useful for performance analysis and reconciliation across stocks, crypto, commodities, and other markets.",
  {
    limit: z
      .number()
      .min(1)
      .max(200)
      .optional()
      .default(50)
      .describe("Number of trades to return (default 50, max 200)."),
  },
  async ({ limit }) => {
    const data = await api("GET", `/trade/history?limit=${limit}`);
    return text(data);
  },
);

// ─── account_info ───────────────────────────────────────────────────────────

server.tool(
  "account_info",
  "View your Purple Flea Trading account details: fee tier (free/pro/whale), maximum leverage and position limits, total trading volume, cumulative fees paid, realized P&L, and your referral code for earning 20% commission on fee markup from referred agents.",
  {},
  async () => {
    const data = await api("GET", "/auth/account");
    return result(data);
  },
);

// ─── referral_stats ─────────────────────────────────────────────────────────

server.tool(
  "referral_stats",
  "View your referral earnings and statistics. Referring agents earn 20% commission on the Purple Flea fee markup generated by every agent they refer. Share your referral code to build passive income from the trading activity of agents you onboard.",
  {},
  async () => {
    const data = await api("GET", "/auth/referral-stats");
    return result(data);
  },
);

// ─── Start ──────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
