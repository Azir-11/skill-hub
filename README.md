# Skill Hub

一个基于 Next.js 16 的 AI 工具导航站，用来展示精选项目卡片、分类筛选、搜索和 GitHub 元数据同步能力。

项目统一使用 `pnpm` 管理依赖。

## 项目特性

- 基于 App Router 构建的轻量展示站点。
- 支持按分类筛选、关键字搜索和分页浏览。
- 本地数据源位于 `data/skills.json`，方便直接维护内容。
- 通过 `scripts/sync-skills.mjs` 同步 GitHub 星标、更新时间和版本信息。
- 使用 `tsgo` 做类型检查，使用 `oxlint` 和 `oxfmt` 负责代码质量与格式化。

## 技术栈

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript
- `@typescript/native-preview` 提供的 `tsgo`
- Oxc 工具链：`oxlint`、`oxfmt`

## 目录结构

```text
.
├── app/                  # App Router 页面与全局样式
├── components/           # 页面组件与基础 UI 组件
├── data/skills.json      # 技能卡片静态数据
├── lib/                  # 数据转换与通用工具
├── public/               # 静态资源
└── scripts/              # 数据同步脚本
```

## 本地开发

先安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

默认访问地址为 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
pnpm dev
pnpm build
pnpm start
pnpm typecheck
pnpm lint
pnpm lint:fix
pnpm fmt
pnpm fmt:check
pnpm sync:skills
```

## 数据维护

站点内容来自 `data/skills.json`。每一项技能包含以下核心字段：

- `name`：项目名称
- `description`：卡片短描述
- `full_description`：更完整的项目说明
- `category`：分类，目前支持 `Prompt`、`UI-UX`、`CLI`、`Agent`、`Script`
- `github_url`：仓库地址
- `version`、`stars`、`updated_at`：可由同步脚本刷新
- `recommendation_score`：站内排序分数
- `tags`：搜索和展示使用的标签

## GitHub 数据同步

运行下面的命令可以刷新仓库元数据：

```bash
pnpm sync:skills
```

如果你希望提升 GitHub API 配额，可以在执行前设置 `GITHUB_TOKEN`：

```bash
GITHUB_TOKEN=your_token pnpm sync:skills
```

当 API 限流时，脚本会自动回退到 GitHub 页面和 Atom feed 抓取版本与更新时间。

## 代码质量

这个项目不再使用 ESLint。

- `pnpm lint` 使用 `oxlint`
- `pnpm fmt` 使用 `oxfmt`
- `pnpm typecheck` 使用 `tsgo`

这三条命令可以覆盖日常开发中的静态检查、格式化和类型校验流程。
