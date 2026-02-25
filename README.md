# @purpleflea/trading-mcp

[![npm version](https://img.shields.io/npm/v/@purpleflea/trading-mcp.svg)](https://www.npmjs.com/package/@purpleflea/trading-mcp)
[![MCP](https://img.shields.io/badge/MCP-compatible-blue.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server for **Purple Flea Trading** — trade 275+ perpetual markets from any AI agent.

Stocks, crypto, commodities, forex, and indices. One API. Powered by [Hyperliquid](https://hyperliquid.xyz), the most liquid decentralised exchange.

## Markets

| Category | Count | Examples | Max Leverage |
|---|---|---|---|
| **Crypto** | 229 | BTC, ETH, SOL, XRP, DOGE, AVAX, LINK | Up to 50x |
| **Stocks** | 29 | TSLA, NVDA, AAPL, GOOGL, META, AMD, AMZN | Up to 5x |
| **Commodities** | 9 | GOLD, SILVER, OIL, URANIUM, COPPER, PLATINUM | Up to 10x |
| **Indices** | 7 | SPX, JP225, DXY, XYZ100 | Up to 20x |
| **Forex** | 2 | EUR, JPY | Up to 50x |

All markets trade 24/7. No market hours, no weekends. Execution against Hyperliquid's on-chain order book with depth rivalling Binance.

## Quick Start

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "trading": {
      "command": "npx",
      "args": ["-y", "@purpleflea/trading-mcp"],
      "env": {
        "TRADING_API_KEY": "sk_trade_..."
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add trading -- npx -y @purpleflea/trading-mcp
```

Set your API key:

```bash
export TRADING_API_KEY=sk_trade_...
```

### Cursor / VS Code

Add to your MCP settings:

```json
{
  "trading": {
    "command": "npx",
    "args": ["-y", "@purpleflea/trading-mcp"],
    "env": {
      "TRADING_API_KEY": "sk_trade_..."
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `TRADING_API_KEY` | Your Purple Flea API key (`sk_trade_...`) | — |
| `TRADING_API_URL` | API base URL | `http://localhost:3003` |

## Tools

### `register`
Create a trading account. Returns an API key for authenticated access to all 275+ markets. Optionally provide a referral code.

### `list_markets`
Browse all available markets by category — stocks, crypto, commodities, forex, indices, or real-world assets.

### `market_price`
Get the real-time price for any market. Prices sourced from Hyperliquid's on-chain order book.

### `open_position`
Open a leveraged long or short position. Specify market, direction, size in USD, and leverage.

### `close_position`
Close an open position at the current market price. Returns realized P&L.

### `set_stop_loss`
Attach a stop-loss to an open position. Automatically closes at the specified price to limit downside.

### `set_take_profit`
Attach a take-profit to an open position. Automatically closes at the specified price to lock in gains.

### `positions`
View open positions with live prices, unrealized P&L, margin, and liquidation levels.

### `orders`
View pending and filled orders — market, limit, stop-loss, and take-profit.

### `trade_history`
Full execution history with fill prices, fees, and realized P&L.

### `account_info`
Account details: tier, leverage limits, volume, fees, P&L, and referral code.

### `referral_stats`
Referral earnings and statistics. Agents earn 20% commission on fee markup from referred traders.

## Fee Tiers

| Tier | Markup | Requirement |
|---|---|---|
| Free | Hyperliquid fee + 2 bps | Default |
| Pro | Hyperliquid fee + 1 bp | $50k+ monthly volume |
| Whale | Hyperliquid fee only | $500k+ monthly volume |

## Referrals

Agents earn **20% commission** on the Purple Flea fee markup from every agent they refer. Share your referral code to build passive income from referred trading activity.

## Why Hyperliquid?

- **Deepest DEX liquidity** — order book depth rivalling Binance
- **275+ perpetual markets** — crypto, stocks, commodities, forex, indices in one venue
- **On-chain execution** — transparent, verifiable, non-custodial
- **Sub-second fills** — purpose-built L1 for trading
- **24/7 markets** — trade Tesla at midnight, gold on Sunday

## Part of the Purple Flea Ecosystem

Purple Flea builds blue chip infrastructure for AI agents:

- **[Trading MCP](https://github.com/purple-flea/trading-mcp)** — 275+ perpetual futures markets (you are here)
- **[Wallet MCP](https://github.com/purple-flea/wallet-mcp)** — Non-custodial multi-chain wallets with cross-chain swaps
- **[Casino MCP](https://github.com/purple-flea/casino-mcp)** — Provably fair gambling, 0.5% house edge
- **[Burner MCP](https://github.com/purple-flea/burner-identity)** — Disposable emails & phone numbers for verifications

All services support crypto deposits via any chain/token. Swaps powered by [Wagyu](https://wagyu.xyz).

## License

MIT
