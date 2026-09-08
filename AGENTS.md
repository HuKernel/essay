# 项目约定（随记）

- 每次修改代码后重新打包发布前：先递增 package.json 的 version（patch 位），并在 CHANGELOG.md 顶部补一条对应版本的变更记录，保证打出的安装包版本号可区分、不重复。
- 打包产物固定输出到 `release/`（`npm run dist`）；打包前确认没有正在运行的随记进程占用 `release/win-unpacked`。
