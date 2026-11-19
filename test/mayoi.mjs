import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const binary = args.find(arg => arg !== "--navigation") ?? "/Applications/Mayoi.app/Contents/MacOS/Mayoi";
const cases = [
  { name: "TS re-export", file: "index.ts", line: 0, text: "default", target: "user.ts", targetLine: 4 },
  { name: "TSX aliased module path", file: "screen.tsx", line: 1, text: "@/index", target: "index.ts", targetLine: 0 },
  { name: "TSX imported function", file: "screen.tsx", line: 3, text: "getUser()", target: "user.ts", targetLine: 4 },
  { name: "TSX imported type", file: "screen.tsx", line: 3, text: "User =", target: "user.ts", targetLine: 0 },
  { name: "TSX component", file: "screen.tsx", line: 4, text: "UserCard", target: "card.tsx", targetLine: 5 },
  { name: "TSX prop", file: "screen.tsx", line: 4, text: "name=", target: "card.tsx", targetLine: 2 },
  { name: "JS default import", file: "legacy.js", line: 4, text: "getUser()", target: "user.ts", targetLine: 4 },
  { name: "JS JSDoc type", file: "legacy.js", line: 2, text: "User}", target: "user.ts", targetLine: 0 },
  { name: "JSX component", file: "legacy.jsx", line: 3, text: "UserCard", target: "card.tsx", targetLine: 5 },
];
if (args.includes("--navigation")) {
  cases.push(
    { name: "Type definition", command: "go.typeDefinition", file: "navigation.ts", line: 14, text: "inferred.name", target: "user.ts", targetLine: 0 },
    { name: "Definition in declaration file", file: "navigation.ts", line: 14, text: "greet(", target: "greeter.d.ts", targetLine: 0 },
    { name: "Source definition in JavaScript", command: "go.sourceDefinition", file: "navigation.ts", line: 14, text: "greet(", target: "greeter.js", targetLine: 1 },
    { name: "Interface implementation", command: "go.implementation", file: "navigation.ts", line: 3, text: "UserSource", target: "navigation.ts", targetLine: 7 },
  );
}

const temp = realpathSync(mkdtempSync(join(tmpdir(), "mayoi-ts-")));
const profile = join(temp, "profile");
const project = join(temp, "project");
const env = {
  ...process.env,
  MAYOI_DATA_DIR: profile,
  PATH: [join(root, "node_modules", ".bin"), process.env.PATH].join(delimiter),
};
delete env.MAYOI_CLI;
delete env.MAYOI_SNAPSHOT;
delete env.MAYOI_SNAPSHOT_RUN;

function run(args, extraEnv = {}) {
  const result = spawnSync(binary, args, { env: { ...env, ...extraEnv }, encoding: "utf8", timeout: 20000 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

let passed = false;
try {
  cpSync(join(root, "test", "project"), project, { recursive: true });
  symlinkSync(join(root, "node_modules"), join(project, "node_modules"), "dir");
  for (const path of [root, join(root, "test", "probe")]) {
    run(["plugin", "dev", path], { MAYOI_CLI: "1" });
  }

  const output = join(project, "result.json");
  for (const [index, test] of cases.entries()) {
    rmSync(output, { force: true });
    writeFileSync(join(project, "case.json"), JSON.stringify(test));
    run([project], {
      MAYOI_SNAPSHOT: join(temp, `case-${index + 1}.png`),
      MAYOI_SNAPSHOT_RUN: `navigation-probe.open navigation-probe.select ${test.command ?? "go.definition"} navigation-probe.record navigation-probe.record`,
    });
    const actual = JSON.parse(readFileSync(output, "utf8"));
    assert.equal(relative(project, realpathSync(actual.path)), join("src", test.target), test.name);
    assert.equal(actual.line, test.targetLine, test.name);
    console.log(`PASS ${test.name} → ${test.target}:${actual.line + 1}:${actual.character + 1}`);
  }
  passed = true;
} finally {
  if (passed) rmSync(temp, { recursive: true });
  else console.error(`Mayoi test profile and screenshots: ${temp}`);
}
