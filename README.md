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

包含语义导航改动的 Mayoi 构建还支持下面的操作。也可以从 **Go** 菜单运行对应命令。

| 操作 | 用法 |
| --- | --- |
| 定义 | macOS 按住 Cmd 点击符号，Windows 和 Linux 使用 Ctrl |
| 类型定义 | 对变量运行 **Go to Type Definition**，跳到它的类型声明 |
| 源码定义 | 对第三方调用运行 **Go to Source Definition**，在服务可以解析时打开实现源码 |
| 实现 | 对接口或抽象方法运行 **Go to Implementation** |
| 引用 | 按 **Shift+F12**，选择一条结果打开对应文件与位置 |

- 路径别名取自项目的 `tsconfig.json` 或 `jsconfig.json`。React 和其他依赖的类型由项目安装，插件启动时关闭自动下载 `@types`。
- 服务优先使用工作区中兼容的 `tsserver.js`，也可使用与服务一起安装的 TypeScript 6。TypeScript 7 的原生 LSP 需要单独接入。
- 每个工程使用一个语义服务器。首次跳转可能要等项目载入，这也避免了载入期间跨文件查询落到只做语法分析的进程。
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

用带语义导航改动的构建复查类型定义、实现和从 `.d.ts` 到 `.js` 的源码跳转时，增加 `--navigation`。

```sh
node test/mayoi.mjs /absolute/path/to/Mayoi --navigation
```

本地 macOS arm64 构建通过扩展的 13 项测试。桌面联调另验证了 Cmd+点击 `greet` 打开 `greeter.d.ts`，以及用 **Shift+F12** 查询 `getUser` 并从结果选择 `screen.tsx` 的调用。
