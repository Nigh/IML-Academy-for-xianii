# 技术决策索引

- Vite SPA + hash：静态资源应用，无服务器和课程级 SEO 要求；刷新深链接只请求 index。
- Curriculum first：身份/依赖唯一真源；实现状态属于课内导出，不在目录重复手工维护。
- Svelte 组件 + TypeScript：交互作为代码，不使用 MDX 体系；静态说明可按需增加普通 Markdown。
- Xianii tokens：官方 npm theme.css；不复制品牌色，不把主题误当 Svelte 组件库。
- SVG first：以向量加法验证最小图形能力，按需再加 uPlot/D3。
- Versioned local progress：无账号，JSON 备份/合并，损坏不覆盖。
- PWA prompt update：离线资源与 build 同版本，用户确认刷新以保留学习操作。
- One owner per lesson：稳定 ID、glob 加载和独立 worktree，避免课程 PR 争抢注册表。
