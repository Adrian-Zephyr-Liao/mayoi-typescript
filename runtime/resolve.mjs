import { createRequire } from "node:module";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
// src/resolve.ts
const runtime = dirname(fileURLToPath(import.meta.url));
const vendor = join(runtime, "vendor");
function workspaceNativeTsc(root) {
	const require = createRequire(join(root, "package.json"));
	let packageFile;
	try {
		packageFile = require.resolve("typescript/package.json");
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "MODULE_NOT_FOUND") return;
		throw error;
	}
	const pkg = JSON.parse(readFileSync(packageFile, "utf8"));
	const major = Number(pkg.version.split(".")[0]);
	const packageRoot = dirname(packageFile);
	if (major < 7 || existsSync(join(packageRoot, "lib", "tsserver.js"))) return void 0;
	const tsc = pkg.bin?.tsc && join(packageRoot, pkg.bin.tsc);
	if (!tsc || !existsSync(tsc)) throw new Error(`TypeScript ${pkg.version} has no tsc entry. Reinstall the project's dependencies.`);
	return tsc;
}
function launch(root) {
	const native = workspaceNativeTsc(root);
	if (native) return {
		command: process.execPath,
		args: [
			native,
			"--lsp",
			"--stdio"
		],
		configuration: { "js/ts": { tsserver: { automaticTypeAcquisition: { enabled: false } } } },
		sourceDefinition: {
			method: "custom/textDocument/sourceDefinition",
			capability: "customSourceDefinitionProvider"
		}
	};
	const [major, minor, patch] = process.versions.node.split(".").map(Number);
	if (major < 22 || major === 22 && (minor < 22 || minor === 22 && patch < 2)) throw new Error("The bundled TypeScript server needs Node.js 22.22.2 or later.");
	const cli = join(vendor, "typescript-language-server", "lib", "cli.mjs");
	const fallback = join(vendor, "typescript", "lib", "tsserver.js");
	if (!existsSync(cli) || !existsSync(fallback)) throw new Error("The bundled runtime is missing. Reinstall the Mayoi plugin.");
	return {
		command: process.execPath,
		args: [cli, "--stdio"],
		initializationOptions: {
			disableAutomaticTypingAcquisition: true,
			tsserver: {
				useSyntaxServer: "never",
				fallbackPath: fallback
			}
		}
	};
}
try {
	const request = JSON.parse(readFileSync(0, "utf8"));
	const root = request && typeof request === "object" && "root" in request ? request.root : void 0;
	if (typeof root !== "string" || !isAbsolute(root)) throw new Error("Mayoi must pass an absolute workspace path.");
	const canonical = realpathSync(root);
	const server = launch(canonical);
	if (root !== canonical) {
		const serverURI = pathToFileURL(canonical).href;
		server.workspaceFolders = [{
			uri: serverURI,
			name: basename(root) || root
		}];
		server.pathMappings = [{
			clientURI: pathToFileURL(root).href,
			serverURI
		}];
	}
	process.stdout.write(JSON.stringify(server) + "\n");
} catch (error) {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
}
export {};
