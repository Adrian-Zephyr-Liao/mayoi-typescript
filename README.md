# TypeScript and JavaScript for Mayoi

在 Mayoi 中按 **F12**，可从 JavaScript、TypeScript、JSX 和 TSX 跳到模块或符号的定义。插件通过 [TypeScript Language Server](https://github.com/typescript-language-server/typescript-language-server) 接入 Mayoi 的 LSP 客户端。Mayoi 也可使用同一服务显示类型悬浮信息、诊断和基础补全。

## 安装

需要 Node.js 22.22.2 或更新版本。以下版本组合用于首版验证。在执行插件命令前，切换到本仓库根目录。

```sh
npm install -g typescript-language-server@6.1.0 typescript@6.0.3
typescript-language-server --version
mayoi plugin dev
```

确保 Mayoi 启动时能在 PATH 中找到 `node` 和 `typescript-language-server`。macOS 上，Mayoi 会读取登录 shell 的 PATH。如果刚才的版本检查找不到命令，先把 npm 的全局可执行文件目录加入登录 shell 的 PATH，再重新启动 Mayoi。

在 Mayoi 中打开业务项目目录，把光标放在导入路径、调用、类型名、JSX 组件名或属性名上，按 **F12**。卸载开发链接用 `mayoi plugin remove mayoi-typescript`。

- 路径别名取自项目的 `tsconfig.json` 或 `jsconfig.json`。React 和其他依赖的类型由项目安装，插件启动时关闭自动下载 `@types`。
- 服务优先使用工作区中兼容的 `tsserver.js`，也可使用与服务一起安装的 TypeScript 6。TypeScript 7 的原生 LSP 需要单独接入。
- JSX 和 TSX 的语言 ID 分别是 `javascriptreact` 和 `typescriptreact`。按语言 ID 配置的格式化器、片段和保存设置可为这两个 ID 增加对应项。
- Mayoi 0.22.4 在 macOS 上通过目录别名打开测试工程时出现过“未找到定义”。遇到这种情况，使用 `pwd -P` 返回的实际路径重新打开项目。

## 验证

上述安装命令面向日常使用。复现测试只需本地依赖和 macOS 上的 Mayoi 应用。测试使用独立临时配置与示例项目，调用 F12 对应的真实编辑器命令，并读取跳转后的文件和位置。

```sh
npm ci
npx --no-install tsc -p test/project
node test/mayoi.mjs
```

也可以在最后一条命令后传入 Mayoi 应用可执行文件的绝对路径。测试失败时会保留临时项目、配置和截图。

已在 macOS arm64 的 Mayoi 0.22.4 上通过 9 项真实跳转测试，覆盖 JS 默认导入和 JSDoc、TS 再导出、TSX 路径别名和类型引用，以及 JSX/TSX 组件与 Props。

## 后续宿主能力

| 导航能力 | Mayoi 宿主需要提供 |
| --- | --- |
| Cmd/Ctrl+点击 | 鼠标命中符号后调用与 F12 相同的定义查询 |
| 类型定义、实现、引用 | 接入 `textDocument/typeDefinition`、`textDocument/implementation`、`textDocument/references`，按服务器能力显示命令 |
| 源码定义 | 支持服务器命令和位置结果，让插件声明 `_typescript.goToSourceDefinition` |
| 定义预览、多目标、返回 | 在真实编辑器中选择或预览目标，记录跨文件导航历史 |

首版的 F12 可从显式类型名跳到它的声明。对一个变量查询其推断类型所在的定义，需要宿主接入独立的类型定义命令。自动导入和跨文件重命名还需要 Mayoi 处理补全附带编辑或工作区编辑。
