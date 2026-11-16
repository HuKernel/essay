# 项目约定（随记）

- 每次修改代码后重新打包发布前：先递增 package.json 的 version（patch 位），并在 CHANGELOG.md 顶部补一条对应版本的变更记录，保证打出的安装包版本号可区分、不重复。
- 打包产物固定输出到 `release/`（`npm run dist`）；打包前确认没有正在运行的随记进程占用 `release/win-unpacked`。
- 本机 360 终端安全会短暂锁定新写出的 exe，electron-builder 在 rcedit/NSIS 步骤偶发 "Unable to commit changes"/mmap 失败——直接原样重跑一次即可，仍失败就换 `--config.directories.output=release-nextN` 新目录打，产物再归位回 `release/`。
- 发布走 GitHub Actions（`.github/workflows/release.yml`）：push `v*` 标签自动 lint/test/打包并上传安装包到 Release；**注意 `npm run lint` 必须零 error 才能 CI 通过**，本地提交前先全仓库跑一遍。electron-builder 缓存丢失需联网下载时用镜像：`ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/`。
- **教训（2026-11-11 Note not found 事故）**：给高频共享函数（如 listNotes，被 60s 任务扫描轮询调用）挂副作用（清理类逻辑）时，必须先 grep 全部调用方评估放大效应——清理判定必须带时间护栏（只清 N 分钟前的数据），"正在使用中"的对象绝不能清；保存链路对"行不存在"要 upsert 自愈而不是抛错。

# 数据删除铁律（用户明确要求，2026-11-16）

- 一切删除/清理操作（回收站物理清理、备份修剪、缓存清理、空记录清理等）**只允许作用于随记数据目录内部的衍生数据**：`backups/`、`notes/` 影子 JSON、`attachments/` 资产、`.tmp` 残留、staging 目录、数据库行。
- 用户磁盘上的**外部源文件**（导入时 file_path 关联的 .md/.txt 原件等）**绝不允许删除**——只允许在保存时回写更新内容。给任何清理逻辑扩大范围前必须重读本条。

# 多模型协作开发规范（用户明确要求，2026-11-09）

用户喊「开发」某功能时不能单人完成，必须按以下分工协调多模型（用 CreateWorkflow 的 subagent_model 指定，模型 ID 先用 ListModels 查最新 providerId/modelId）：

- **产品方案**：固定 `deepseek-flash` + `qwen3.8-flash` 两个模型协商（各自提方案 → 交叉评审 → 合并成稿）。仅当某模型在当前 key 里确实不存在时，才回退为 `glm-5.3` + `glm-5.3-flash` 协商。
- **前端**（src/renderer）：首选 `qwen3.7-plus`；当前 key 没有（一直都没有）就换成 **`glm-5.3-flash`**。
- **后端**（src/main、数据层）：`glm-5.3`。
- **测试**：`glm-5.3`（typecheck/lint/vitest + tests/uia-*.ps1 UIA 脚本；注意本机 vitest 偶发 EBUSY 环境问题）。
- **通用回退规则（2026-11-09 用户补充并修正）**：凡上述指定模型经 ListModels 查证确实不存在或不可用时，才回退到 `glm-5.3` / `glm-5.3-flash`；查得到的模型（如 `deepseek-flash`、`qwen3.8-flash`）必须按指定角色使用，不要擅自替换。

# UX 硬约束（用户要求）

- 现有布局骨架保持不变，只允许小幅微调，不接受元素位置大改。优化方向见 `docs/ux-research-2026-11-09.md`。
