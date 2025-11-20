# 《新概念英语》在线学习平台

一个功能完整的《新概念英语》在线学习网站，支持音频点读、歌词同步显示和交互式学习体验。

## 🚀 快速部署

### 通过Vercel一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/new-concept-english)

### 手动部署步骤

1. **准备代码**
   ```bash
   git clone https://github.com/your-username/new-concept-english
   cd new-concept-english
   ```

2. **推送到GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Vercel部署**
   - 访问 [Vercel](https://vercel.com)
   - 导入GitHub仓库
   - 自动检测为静态网站
   - 点击部署

4. **绑定自定义域名**
   - 在Vercel项目设置中添加域名 `nce.ichochy.com`
   - 在Cloudflare DNS中添加CNAME记录：
     ```
     Type: CNAME
     Name: nce
     Content: cname.vercel-dns.com
     ```

## 📁 项目结构

```
├── index.html          # 主页面
├── book.html           # 课本页面  
├── lesson.html         # 课文页面
├── vercel.json         # Vercel配置
├── CNAME              # 域名配置
├── static/            # 静态资源
│   ├── base.css       # 基础样式
│   ├── index.css      # 首页样式
│   ├── book.css       # 课本页面样式
│   ├── lesson.css     # 课文页面样式
│   ├── book.js        # 课本页面逻辑
│   ├── lesson.js      # 课文页面逻辑
│   └── data.json      # 课程数据
├── images/            # 教材封面
└── NCE1-4/           # 四册教材资源
    ├── *.mp3         # 音频文件
    └── *.lrc         # 歌词文件
```

## 🎯 功能特性

- ✅ 完整的四册《新概念英语》教材
- ✅ 音频点读与歌词同步显示
- ✅ 点击句子分段播放
- ✅ 响应式设计，支持移动端
- ✅ 深色主题，护眼设计
- ✅ 流畅的动画效果
- ✅ 离线缓存支持

## 🔧 技术栈

- **前端**: HTML5, CSS3, JavaScript ES6+
- **部署**: Vercel (静态网站托管)
- **域名**: Cloudflare DNS管理
- **音频**: Web Audio API
- **样式**: Flexbox + Grid布局

## 📊 内容规模

| 教材 | 课程数量 | 级别 |
|------|----------|------|
| 第一册 | 144课 | 英语初阶 |
| 第二册 | 96课 | 实践与进步 |
| 第三册 | 60课 | 培养技能 |
| 第四册 | 48课 | 流利英语 |

**总计**: 348课，696个多媒体文件

## 🔄 更新维护

### 添加新课程
1. 在对应教材目录添加MP3和LRC文件
2. 更新 `static/data.json` 中的课程列表
3. 重新部署到Vercel

### 自定义域名
修改 `CNAME` 文件中的域名，然后在Vercel和Cloudflare中更新配置。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**部署状态**: ✅ 已配置Vercel部署  
**域名绑定**: ✅ 支持自定义域名 `nce.ichochy.com`  
**HTTPS**: ✅ 自动启用  
**CDN**: ✅ 全球加速
