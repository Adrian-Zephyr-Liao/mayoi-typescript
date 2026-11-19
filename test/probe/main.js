import { commands, editor, workspace } from "mayoi";

commands.register("navigation-probe.open", async () => {
  const { file } = JSON.parse(await workspace.readFile("case.json"));
  await workspace.open(`src/${file}`);
});

commands.register("navigation-probe.select", async () => {
  const { file, line, text } = JSON.parse(await workspace.readFile("case.json"));
  const active = await editor.active();
  if (active.document.name !== file) throw new Error("Test file is not the active editor");
  const character = (await active.document.lineAt(line)).indexOf(text);
  if (character < 0) throw new Error("Test symbol not found in the active editor");
  const point = { line, character: character + 1 };
  await active.setSelections([{ anchor: point, active: point }]);
});

commands.register("navigation-probe.record", async () => {
  const active = await editor.active();
  const { path, language } = active.document;
  await workspace.writeFile("result.json", JSON.stringify({ path, language, ...active.selection.active }));
});
