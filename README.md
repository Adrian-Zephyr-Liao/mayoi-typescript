# TypeScript and JavaScript for Mayoi

在 Mayoi 中按 **F12**，可从 JavaScript、TypeScript、JSX 和 TSX 跳到模块或符号的定义。Mayoi 也可使用同一语言服务显示类型悬浮信息、诊断和基础补全。

## 安装

在 Mayoi 的插件设置里粘贴下面的地址并点击安装。

```text
Adrian-Zephyr-Liao/mayoi-typescript
```

本地工作区的一键安装需要支持 `localResolve` 的 Mayoi 构建，以及 `PATH` 中的 Node.js 22.22.2 或更新版本。插件已自带语言服务器和兜底 TypeScript，安装后可离线启动。 [Mayoi 宿主支持与桌面联调结果](https://github.com/sorrycc/Mayoi/pull/211)

旧版 Mayoi 和 SSH 等远程工作区需要在工作区所在机器的 `PATH` 中提供 `typescript-language-server`。

在 Mayoi 中打开项目，把光标放在导入路径、调用、类型名、JSX 组件名或属性名上，按 **F12**。支持语义导航的 Mayoi 构建还可以从 **Go** 菜单运行以下操作。

| 操作 | 用法 |
| --- | --- |
| 定义 | macOS 按住 Cmd 点击符号，Windows 和 Linux 使用 Ctrl |
| 类型定义 | 对变量运行 **Go to Type Definition**，跳到它的类型声明 |
| 源码定义 | 对第三方调用运行 **Go to Source Definition**，在服务可以解析时打开实现源码 |
| 实现 | 对接口或抽象方法运行 **Go to Implementation** |
| 引用 | 按 **Shift+F12**，选择一条结果打开对应文件与位置 |

- 路径别名取自项目的 `tsconfig.json` 或 `jsconfig.json`。React 和其他依赖的类型由项目安装，插件启动时关闭自动下载 `@types`。
- 工作区有 TypeScript 7 时，启动项目自带的原生 LSP。有兼容的 `tsserver.js` 时，由插件自带的 [TypeScript Language Server](https://github.com/typescript-language-server/typescript-language-server) 加载项目版本。工作区没装 TypeScript 时，插件使用自带的 TypeScript 6.0.3。
- 首次跳转可能要等项目载入。使用 `tsserver.js` 时，插件只启用语义进程，避免跨文件查询落到只做语法分析的进程。
- JSX 和 TSX 的语言 ID 分别是 `javascriptreact` 和 `typescriptreact`。按语言 ID 配置的格式化器、片段和保存设置可为这两个 ID 增加对应项。

## 开发与验证

`src/resolve.ts` 根据工作区返回 Mayoi 的语言服务启动参数。Vite+ 的 `vp pack` 生成 `runtime/resolve.mjs`，`scripts/prepare-runtime.ts` 按锁文件复制第三方运行时及许可到 `runtime/vendor`。这两项生成产物随 Git 分发，下面的命令用于开发和升级依赖。 [启动器源码](src/resolve.ts) · [运行时打包脚本](scripts/prepare-runtime.ts)

```sh
npm ci
npm run typecheck
npm run build
npm test
```

在 macOS 上可通过 Mayoi 的 Git 安装入口验证当前提交。测试在独立配置中安装插件，在没有项目 TypeScript 和全局语言服务的情况下运行真实编辑器命令，并确认跳转目标。失败时保留临时项目、配置和截图。

```sh
node test/mayoi.mjs /absolute/path/to/Mayoi --installed --navigation
```

复查项目版本时，将 `MAYOI_TEST_TYPESCRIPT` 设为已安装的 `node_modules/typescript` 目录的绝对路径。
