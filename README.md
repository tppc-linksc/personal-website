# 个人作品集网站

一个现代化的个人作品集网站，展示项目、技能和创意作品。采用 AI 驱动的开发方式，快速将想法变成现实。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **存储**: 本地 JSON 文件
- **部署**: Vercel / 自托管

## 功能特点

### 前台展示
- 响应式设计，支持移动端和桌面端
- 中英文双语支持
- 深色/浅色主题切换
- 项目展示卡片
- 项目详情页
- 留言板功能
- 访问量统计
- 骨架屏加载动画

### 后台管理 (Studio CMS)
- 项目管理（创建、编辑、删除）
- 三阶段编辑流程：基础信息 → 内容信息 → 发布信息
- 封面图片上传
- 草稿/发布状态管理
- 安全的登录认证

### 内容管理 (/content)
- 在线编辑首页 Hero 区域文字（标题、描述、按钮）
- 在线编辑关于我区域（描述、技能标签）
- 头像图片上传（支持拖拽）
- 品牌名称和底部联系方式
- 保存后首页实时更新

### API 接口
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建/更新/删除项目
- `GET /api/studio/session` - 检查登录状态
- `POST /api/studio/session` - 管理员登录
- `DELETE /api/studio/session` - 退出登录
- `POST /api/studio/upload` - 上传封面图片
- `GET /api/projects/[slug]/messages` - 获取留言
- `POST /api/projects/[slug]/messages` - 提交留言
- `GET /api/metrics/visits` - 获取访问量
- `POST /api/metrics/visits` - 记录访问

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，配置以下变量：

### 必需配置

```env
# 管理员认证（二选一）
# 方式 1: 明文 Token（简单）
STUDIO_ADMIN_TOKEN=

# 方式 2: 哈希 Token（推荐，更安全）
STUDIO_ADMIN_TOKEN_HASH=sha256:salt:hash

# 会话密钥（推荐）
STUDIO_SESSION_SECRET=
```

### 3. 生成管理员 Token 哈希

推荐使用哈希模式存储管理员 Token：

```bash
npm run studio:hash -- "your-plain-token"
```

将输出的 `sha256:<salt>:<hash>` 格式内容填入 `.env.local` 的 `STUDIO_ADMIN_TOKEN_HASH`。

### 4. 启动开发服务器

```bash
npm run dev
```

访问：
- 前台首页: http://localhost:3000 （自动跳转到 `/zh`）
- Studio 登录: http://localhost:3000/studio/login
- Studio CMS: http://localhost:3000/studio
- 内容管理: http://localhost:3000/content

## 项目结构

```
personal-website/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # 国际化路由
│   │   ├── page.tsx              # 首页
│   │   ├── loading.tsx           # 首页骨架屏
│   │   └── projects/             # 项目页面
│   │       ├── page.tsx          # 项目列表
│   │       ├── loading.tsx       # 项目列表骨架屏
│   │       └── [slug]/           # 项目详情
│   │           └── page.tsx      # 项目详情页
│   ├── api/                      # API 路由
│   │   ├── projects/             # 项目 API
│   │   ├── studio/               # Studio API
│   │   ├── messages/             # 留言 API
│   │   └── metrics/              # 统计 API
│   ├── studio/                   # Studio CMS
│   │   ├── page.tsx              # CMS 主页
│   │   └── login/                # 登录页
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 根页面（重定向）
│   └── globals.css               # 全局样式
├── components/                   # React 组件
│   ├── studio/                   # Studio CMS 子组件
│   │   ├── ProjectList.tsx       # 项目列表侧栏
│   │   ├── BasicTab.tsx          # 基础信息编辑
│   │   ├── ContentTab.tsx        # 内容信息编辑
│   │   └── PublishTab.tsx        # 发布信息编辑
│   ├── SiteHeader.tsx            # 网站头部
│   ├── ProjectCard.tsx           # 项目卡片
│   ├── ProjectsFilterGrid.tsx    # 项目筛选网格
│   ├── ProjectDetailActions.tsx  # 项目详情操作
│   ├── MessageBoard.tsx          # 留言板主组件
│   ├── MessageCard.tsx           # 留言卡片
│   ├── ReplyEditor.tsx           # 回复编辑器
│   ├── message-board-types.ts    # 留言板类型定义
│   ├── InteractiveHeroScene.tsx  # Hero 场景
│   ├── Skeleton.tsx              # 骨架屏组件
│   ├── ThemeToggle.tsx           # 主题切换
│   ├── LanguageSwitch.tsx        # 语言切换
│   └── VisitCounter.tsx          # 访问量统计
├── lib/                          # 工具库
│   ├── projects.ts               # 项目数据模型
│   ├── projects-source.ts        # 项目数据源
│   ├── messages.ts               # 留言数据模型
│   ├── messages-source.ts        # 留言数据源
│   ├── i18n.ts                   # 国际化配置
│   ├── site-content.ts           # 网站内容配置（版本化 localStorage）
│   ├── github-stars.ts           # GitHub Stars 获取
│   ├── project-selection.ts      # 项目筛选排序
│   ├── studio-auth.ts            # Studio 认证（HMAC 会话）
│   └── rate-limit.ts             # 文件级限流
├── public/                       # 静态资源
│   ├── hero/                     # Hero 图片
│   ├── projects/                 # 项目封面
│   └── avatar-placeholder.svg    # 头像占位图
├── scripts/                      # 脚本工具
│   └── studio-token-hash.mjs     # Token 哈希生成
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── next.config.ts                # Next.js 配置
├── tailwind.config.ts            # Tailwind 配置
└── .env.example                  # 环境变量示例
```

## 核心功能说明

### 1. 国际化 (i18n)

支持中文和英文两种语言，通过 URL 路径区分：
- 中文: `/zh`
- 英文: `/en`

语言文件位于 `lib/i18n.ts`，所有文案都支持双语。

### 2. 主题系统

支持深色和浅色两种主题：
- 通过 `data-theme` 属性切换
- 使用 CSS 变量实现主题色
- 自动保存用户偏好到 localStorage

### 3. 项目数据源

项目数据存储在本地 TypeScript 文件中（`lib/projects.ts`），无需外部数据库。留言和访问统计存储为 JSON 文件（`data/` 目录）。所有 JSON 文件写入均使用原子写入模式（先写临时文件再 rename），防止写入中断导致数据损坏。

### 3.5 安全机制

- **会话认证**: 基于 HMAC-SHA256 的会话 token，支持明文和哈希两种管理员 Token 存储方式
- **接口限流**: 基于文件持久化的滑动窗口限流，登录接口 5 次/分钟，留言接口 8 次/分钟
- **上传校验**: 仅允许图片类型，限制 5MB 大小，文件名长度 100 字符
- **安全响应头**: X-Content-Type-Options、X-Frame-Options、Referrer-Policy、Permissions-Policy

### 4. Studio CMS

后台管理系统，功能包括：
- 项目 CRUD 操作
- 封面图片上传
- 草稿/发布状态管理
- 安全的会话认证

#### 编辑流程

1. **基础信息**: slug、状态、双语标题/标语
2. **内容信息**: 双语摘要/描述/设计/架构、技术标签
3. **发布信息**: 封面图片、链接、进度、保存草稿/发布上线

#### 发布模型

- `draft`: 草稿，前台不显示
- `published`: 已发布，前台可见

### 5. 内容管理 (/content)

在线编辑网站内容，无需修改代码：
- Hero 区域：问候语、标题、描述、按钮文字和链接（支持中英文双语）
- 关于我：描述文字、技能标签、头像上传
- 品牌名称和底部联系方式
- 内容存储在浏览器 localStorage（带 `__version` 版本号，支持未来数据迁移），保存后页面实时更新

### 6. 留言系统

支持项目留言功能：
- 游客留言
- 管理员回复
- 留言审核
- 嵌套回复
- 数据存储：`data/messages.json`

### 7. 骨架屏加载

使用骨架屏提升用户体验：
- 首页骨架屏
- 项目列表骨架屏
- 平滑过渡动画

## 部署

详细的部署教程（阿里云 + 域名 + ICP 备案 + HTTPS）请查看：

→ **[DEPLOY.md](./DEPLOY.md)**

### 快速开始（本地开发）

```bash
npm install
cp .env.example .env.local  # 编辑 .env.local 填写配置
npm run dev
```

访问 http://localhost:3000

## 开发命令

```bash
# 开发服务器
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 生成 Studio Token 哈希
npm run studio:hash -- "your-token"
```

## 环境变量说明

| 变量名 | 必需 | 说明 | 默认值 |
|--------|------|------|--------|
| `STUDIO_ADMIN_TOKEN` | 是 | 管理员登录密码 | - |
| `STUDIO_OWNER_NAME` | 否 | 管理员名称 | Author |
| `STUDIO_ADMIN_TOKEN_HASH` | 否 | 管理员哈希 Token | - |
| `STUDIO_SESSION_SECRET` | 否 | 会话签名密钥 | 使用 ADMIN_TOKEN |
| `STUDIO_SESSION_TTL_SECONDS` | 否 | 会话有效期（秒） | 259200 |
| `GITHUB_TOKEN` | 否 | GitHub API Token（获取 star 数） | - |
| `GITHUB_STARS_CACHE_TTL_MS` | 否 | Stars 缓存有效期（毫秒） | 1800000 |
| `GITHUB_STARS_TIMEOUT_MS` | 否 | GitHub API 超时（毫秒） | 2500 |

## 数据存储

项目采用纯本地存储，不依赖任何外部数据库：

| 数据类型 | 存储方式 | 文件位置 |
|---------|---------|---------|
| 项目数据 | TypeScript 文件 | `lib/projects.ts` |
| 网站内容 | localStorage（版本化） | 浏览器本地 |
| 留言数据 | JSON 文件（原子写入） | `data/messages.json` |
| 访问统计 | JSON 文件（原子写入） | `data/visits.json` |
| 限流记录 | JSON 文件 | `data/rate-limits.json` |
| 上传图片 | 文件系统 | `public/uploads/` |

数据可随时备份，只需复制 `lib/projects.ts` 和 `data/` 目录即可。`data/rate-limits.json` 为运行时限流数据，无需备份。

## 路线图

### v2.0 - 博客功能
- [ ] 博客文章管理（创建、编辑、删除）
- [ ] Markdown 编辑器支持
- [ ] 文章分类和标签
- [ ] 开发踩坑记录
- [ ] 学习笔记分享
- [ ] 文章搜索功能

### v2.1 - 增强功能
- [ ] 项目演示视频嵌入
- [ ] GitHub 贡献图表集成
- [ ] 多语言内容管理优化
- [ ] 图片 CDN 集成

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
