# Claude Agent SDK Test Harness

Minimal repro environment for SDK bugs.

## Usage

```bash
npm install
npm test                      # interactive multi-turn chat
echo "prompt" | npm test      # single message
```

Logs are written to `/tmp`:
- `claude-sdk-<timestamp>.json` - all raw SDK events
- `claude-sdk-<timestamp>.txt` - text output

## Reproducing bugs

The `chat()` function in `claude.ts` is the shareable SDK code.
Modify it to reproduce specific issues.
