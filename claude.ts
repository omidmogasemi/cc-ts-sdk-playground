import { query, type SDKMessage, type SDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as readline from "readline";

// ============================================================
// SHAREABLE SDK CODE - Copy this function to reproduce issues
// ============================================================

async function* chat(
  input: AsyncIterable<string>
): AsyncGenerator<SDKMessage, void> {
  const userMessages = createUserMessageStream(input);

  for await (const event of query({
    prompt: userMessages,
    options: { dangerously_skip_permissions: true },
  })) {
    yield event;
  }
}

function createUserMessageStream(
  input: AsyncIterable<string>
): AsyncIterable<SDKUserMessage> {
  let sessionId = "";

  return {
    async *[Symbol.asyncIterator]() {
      for await (const message of input) {
        yield {
          type: "user",
          message: { role: "user", content: message },
          parent_tool_use_id: null,
          session_id: sessionId,
        };
      }
    },
  };
}

// ============================================================
// CLI WRAPPER
// ============================================================

async function main() {
  const timestamp = Date.now();
  const jsonLogPath = path.join(os.tmpdir(), `claude-sdk-${timestamp}.jsonl`);
  const textLogPath = path.join(os.tmpdir(), `claude-sdk-${timestamp}.txt`);

  // Create empty files immediately
  fs.writeFileSync(jsonLogPath, "");
  fs.writeFileSync(textLogPath, "");

  console.log("Claude Agent SDK Test Harness");
  console.log(`JSON log: ${jsonLogPath}`);
  console.log(`Text log: ${textLogPath}`);
  console.log("\nType messages and press Enter. Ctrl+C to exit.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const userInput = createReadlineIterable(rl);
  rl.prompt();

  for await (const event of chat(userInput)) {
    // Write each event as a JSON line immediately
    fs.appendFileSync(jsonLogPath, JSON.stringify(event) + "\n");

    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
          fs.appendFileSync(textLogPath, block.text);
        }
      }
    }

    if (event.type === "result") {
      const resultLine = `\n\nResult: ${event.subtype}`;
      console.log(resultLine);
      fs.appendFileSync(textLogPath, resultLine);
      if (event.subtype === "success") {
        const costLine = `Cost: $${event.total_cost_usd.toFixed(4)}`;
        console.log(costLine);
        fs.appendFileSync(textLogPath, `\n${costLine}`);
      }
      fs.appendFileSync(textLogPath, "\n---\n");
      rl.prompt();
    }
  }

  rl.close();
}

async function* createReadlineIterable(
  rl: readline.Interface
): AsyncGenerator<string, void> {
  const lines: string[] = [];
  let resolve: (() => void) | null = null;
  let closed = false;

  rl.on("line", (line) => {
    lines.push(line);
    resolve?.();
  });

  rl.on("close", () => {
    closed = true;
    resolve?.();
  });

  while (!closed) {
    if (lines.length === 0) {
      await new Promise<void>((r) => (resolve = r));
    }
    while (lines.length > 0) {
      yield lines.shift()!;
    }
  }
}

main().catch(console.error);
