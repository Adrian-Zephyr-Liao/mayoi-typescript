import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8")) as {
  packages: Record<string, { version: string }>;
};
const vendor = join(root, "runtime", "vendor");
const packages = {
  "typescript-language-server": ["package.json", "LICENSE", "lib/cli.mjs", "lib/cli.mjs.map"],
  typescript: ["package.json", "LICENSE.txt", "ThirdPartyNoticeText.txt", "lib"],
};

for (const name of Object.keys(packages)) {
  const location = join(root, "node_modules", name, "package.json");
  const { version } = JSON.parse(readFileSync(location, "utf8")) as { version: string };
  if (version !== lock.packages[`node_modules/${name}`]?.version) {
    throw new Error(`${name}@${version} does not match package-lock.json. Run npm ci.`);
  }
}

for (const [name, files] of Object.entries(packages)) {
  const target = join(vendor, name);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(join(target, "lib"), { recursive: true });
  for (const file of files) {
    cpSync(join(root, "node_modules", name, file), join(target, file), { recursive: true });
  }
  console.log(`Bundled ${name}@${lock.packages[`node_modules/${name}`].version}`);
}
