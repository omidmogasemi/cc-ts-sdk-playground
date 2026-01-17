# Claude Agent SDK Test Harness

A minimal TypeScript environment for reproducing bugs in the [Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk).

## Setup

```bash
npm install
```

## Usage

```bash
# Interactive multi-turn chat
npm test

# Single message
echo "your prompt" | npm test
```

## Logs

Each run creates two log files in `/tmp`:
- `claude-sdk-<timestamp>.json` - all raw SDK events
- `claude-sdk-<timestamp>.txt` - text output

The file paths are printed at startup.

## Reproducing Bugs

Edit the `chat()` function in `claude.ts` to reproduce specific SDK issues. This function is marked as the shareable code block that can be copied into bug reports.
