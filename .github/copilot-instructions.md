<!--
  自动为 AI 编码代理准备的项目说明（简洁、有可操作示例）
  目标：让 Copilot / AI agent 在此仓库中立刻高效工作
-->

# 项目速览（供 AI 代理）

这是一个静态站点：一个面向《新概念英语》的多媒体学习平台，使用纯前端 HTML/CSS/JS + 静态资源（MP3/LRC/图片/JSON）。项目通过 Vercel 托管（见 `vercel.json`），没有后端服务。

**关键文件/目录**:
- `index.html`, `book.html`, `lesson.html`：主要入口页面和导航
- `static/`：样式、页面脚本、`data.json`（课程元数据）；示例：`static/book.js`, `static/lesson.js`
- `NCE1/`, `NCE2/`, `NCE3/`, `NCE4/`：四册教材资源目录，包含 `.mp3` 与 `.lrc` 文件（逐课对应）
- `images/`：教材封面等图片
- `deploy-test.js`：本地部署前的结构/一致性检查脚本（可用 `node deploy-test.js` 运行）
- `vercel.json`：Vercel 配置，定义静态构建与缓存策略
- `CNAME`, `README.md`, `LICENSE`

**简短架构说明（大图景）**
- 静态页面 + 静态资源（音频/歌词/图片/JSON）由浏览器直接消费，播放逻辑在 `static/*` 的 JS 中实现（例如分段播放、歌词同步）。
- 课程清单/路由由前端和 `static/data.json` 驱动；新增课程时需要同时添加资源并更新 `static/data.json`。
- Vercel 的 `vercel.json` 为常用静态资源（mp3/lrc/css/js/json/html/jpg）设置了长期缓存（immutable），因此更新这些资源通常需要：修改文件名或使用显式的版本号/查询参数以确保 CDN 失效。

**重要约定与可发现规则（不要凭空假设）**
- 教材文件以数字前缀 + 章节标题命名（例如 `001&002－Excuse Me.lrc`）；`deploy-test.js` 会检查每册 MP3 与 LRC 的数量是否一致——添加资源前请保证数量和命名规则一致。
- 代码风格：项目是原生 JS（ES6+）并以理召开 HTML/CSS 为主；尽量在不引入构建步骤的前提下修改文件（项目无构建工具）。
- 分发/缓存：`vercel.json` 指定静态资源长缓存，谨慎变更已部署的静态文件名或记得更新版本号。

**常用本地/CI 工作流（可直接运行的命令）**
- 本地检查结构： `node deploy-test.js`  —— 会列出缺失文件、每册 MP3/LRC 数量并给出部署准备状态。
- 常规部署流程（Vercel 自动）：
  1. `git add` / `git commit` / `git push origin main`
  2. Vercel 会自动为 `main` 触发部署（不需要本地构建步骤）
- 绑定自定义域：编辑 `CNAME` 并在 Vercel/Cloudflare 中配置 CNAME（见 `README.md` 中的 DNS 示例）。

**对 AI 代理的明确行动指南（工作要点）**
- 若增添课程：在对应 `NCEx/` 目录加入 `.mp3` 和 `.lrc`，确保两者数量匹配；更新 `static/data.json`（课程元数据）；运行 `node deploy-test.js` 验证，然后提交并推送。
- 若修改播放逻辑：优先编辑 `static/lesson.js` 或 `static/book.js`。搜索 `play`/`audio`/`lrc` 关键字以定位实现点。
- 静态资源更新注意缓存：若需强制刷新用户端资源，变更文件名（例如增加版本号）或在引用处添加版本查询参数。
- 小心第三方脚本：`index.html` 含 Google Analytics (`gtag.js`)，修改时不要破坏现有跟踪代码。

**容易出错或需人工判断的场景**
- 音频与歌词不同步或数量不匹配：`deploy-test.js` 会标记为失败，但 AI 不应自动删除/重命名文件，先在 PR 中提出建议并让维护者确认。
- 重命名大量资源会触发 CDN 刷新问题：当需要做批量文件名变更时，应该在 PR 中写清楚版本变更意图并提供回滚方案。

**示例片段**
- 运行结构检查：
```
node deploy-test.js
```
- 新增课程（示例流程）：
```
# 把 121.mp3 和 121.lrc 放到 NCE3/ （示例）
# 更新 static/data.json（在正确位置插入新条目）
node deploy-test.js   # 验证
git add . && git commit -m "Add lesson 121 to NCE3" && git push
```

**如果不确定**
- 在遇到文件命名冲突、资源不匹配或缓存策略变更时：创建一个描述性 Issue 或 PR，并在正文中包含 `node deploy-test.js` 的输出，等待维护者确认再合并自动修改。

---
如果你希望我把 `static/data.json` 的结构读取出来并在说明里加入具体字段示例，或把当前 `static/*.js` 中的播放相关函数摘录为更精确的指导，我可以继续扫描并把样例直接补进去。请告诉我你想要的深度（例如“只要高层指导”或“逐文件 API 摘录”）。
