# Gobi Web

Gobi Web 是一个现代化的商业智能（BI）系统前端界面，基于 Vue 3 和 Element Plus 构建。

## 功能特性

- 🎨 现代化的用户界面设计
- 📊 丰富的数据可视化功能
- 🔍 灵活的查询管理
- 👥 完善的用户权限管理
- 📱 响应式设计，支持移动端
- 🔒 安全的身份认证

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- Vite - 下一代前端构建工具
- Element Plus - 基于 Vue 3 的组件库
- Vue Router - Vue.js 官方路由管理器
- Pinia - Vue 的状态管理库
- Axios - 基于 Promise 的 HTTP 客户端
- SCSS - CSS 预处理器

## 开发环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

## 快速开始

1. 克隆项目
```bash
git clone git@github.com:sy-vendor/GobiWeb.git
cd GobiWeb
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
GobiWeb/
├── src/                    # 源代码目录
│   ├── assets/            # 静态资源
│   ├── components/        # 公共组件
│   ├── layouts/           # 布局组件
│   ├── router/            # 路由配置
│   ├── styles/            # 全局样式
│   ├── views/             # 页面组件
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── public/                # 公共资源目录
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 主要功能模块

### 1. 仪表盘
- 系统概览
- 数据统计
- 查询趋势
- 热门查询

### 2. 查询管理
- 创建查询
- 编辑查询
- 执行查询
- 查询历史

### 3. 图表管理
- 创建图表
- 编辑图表
- 图表预览
- 图表分享

### 4. 用户管理
- 用户列表
- 角色管理
- 权限控制
- 密码重置

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 Vue 3 组合式 API 风格
- 使用 TypeScript 进行类型检查

### 提交规范
提交信息格式：
```
<type>(<scope>): <subject>

<body>

<footer>
```

type 类型：
- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

### 分支管理
- main: 主分支，用于生产环境
- develop: 开发分支，用于开发环境
- feature/*: 功能分支，用于开发新功能
- hotfix/*: 修复分支，用于修复生产环境的问题

## 部署

1. 构建项目
```bash
npm run build
```

2. 部署 dist 目录到 Web 服务器

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (git checkout -b feature/AmazingFeature)
3. 提交你的改动 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 开启一个 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

- 项目维护者：[Your Name]
- 邮箱：[Your Email]