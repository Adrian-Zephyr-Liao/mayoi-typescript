import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const resolver = fileURLToPath(new URL("../runtime/resolve.mjs", import.meta.url));

function fixture(t) {
  const root = mkdtempSync(join(realpathSync(tmpdir()), "mayoi-ts-resolver-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function resolve(root) {
  const run = spawnSync(process.execPath, [resolver], {
    input: JSON.stringify({ root }),
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  return JSON.parse(run.stdout);
}

test("a project with no TypeScript launches from the plugin's offline runtime", (t) => {
  const result = resolve(fixture(t));
  assert.equal(result.command, process.execPath);
  assert.match(result.args[0], /runtime[\\/]vendor[\\/]typescript-language-server[\\/]lib[\\/]cli\.mjs$/);
  assert.ok(existsSync(result.args[0]));
  assert.ok(existsSync(result.initializationOptions.tsserver.fallbackPath));
  assert.equal(result.initializationOptions.tsserver.path, undefined);
});

test("an installed native TypeScript starts its own compiler entry", (t) => {
  const root = fixture(t);
  const pkg = join(root, "node_modules", "typescript");
  mkdirSync(join(pkg, "bin"), { recursive: true });
  writeFileSync(join(pkg, "package.json"), JSON.stringify({ version: "7.0.2", bin: { tsc: "bin/tsc" } }));
  writeFileSync(join(pkg, "bin", "tsc"), "");
  assert.deepEqual(resolve(root), {
    command: process.execPath,
    args: [join(pkg, "bin", "tsc"), "--lsp", "--stdio"],
    configuration: {
      "js/ts": { tsserver: { automaticTypeAcquisition: { enabled: false } } },
    },
    sourceDefinition: {
      method: "custom/textDocument/sourceDefinition",
      capability: "customSourceDefinitionProvider",
    },
  });
});

test("workspace aliases map the server's canonical paths back to the editor", (t) => {
  const dir = fixture(t);
  const root = join(dir, "source folder");
  const alias = join(dir, "opened folder");
  mkdirSync(root);
  symlinkSync(root, alias, "junction");
  const result = resolve(alias);
  assert.equal(result.workspaceFolders[0].uri, pathToFileURL(root).href);
  assert.deepEqual(result.pathMappings, [
    { clientURI: pathToFileURL(alias).href, serverURI: pathToFileURL(root).href },
  ]);
});
