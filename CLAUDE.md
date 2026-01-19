# Claude Agent SDK Test Harness

Minimal repro environment for reproducing bugs in the Claude Agent SDK. Use this to create isolated test cases that can be shared with Anthropic.

## Usage

```bash
npm test                      # interactive multi-turn chat
echo "prompt" | npm test      # single message
```

Logs written incrementally to `/tmp`:
- `claude-sdk-<timestamp>.jsonl` - raw SDK events (newline-delimited JSON)
- `claude-sdk-<timestamp>.txt` - text output

## Reproducing bugs

Edit `chat()` in `claude.ts` to reproduce specific issues.
