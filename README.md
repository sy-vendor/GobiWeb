# Gobi Web

Gobi Web 是一个现代化的商业智能（BI）系统前端界面，基于 Vue 3 和 Element Plus 构建，提供强大的数据可视化和分析能力。

## 功能特性

- 🎨 现代化的用户界面设计
- 📊 丰富的数据可视化功能
  - 支持 8 种图表类型：柱状图、折线图、饼图、散点图、雷达图、热力图、仪表盘、漏斗图
  - 智能数据字段适配，自动识别数据类型
  - 灵活的图表配置和样式定制
- 🖼️ 图表导出与打印功能
  - 一键导出图表为高质量 PNG 图片
  - 支持图表打印，自动生成打印预览
  - 2倍像素比率，确保图片清晰度
- 🔍 灵活的查询管理
  - 可视化 SQL 查询编辑器
  - 查询结果实时预览
  - 查询历史记录管理
- 📁 数据源管理
  - 支持 MySQL、PostgreSQL、SQLite 等多种数据库
  - 数据源连接测试
  - 公开/私有数据源权限控制
- 📋 模板管理
  - Excel 模板上传和管理
  - 模板分类和描述
- 👥 完善的用户权限管理
- 📱 响应式设计，支持移动端
- 🔒 安全的身份认证

## 技术栈

- **前端框架**: Vue 3 - 渐进式 JavaScript 框架
- **构建工具**: Vite - 下一代前端构建工具
- **UI 组件库**: Element Plus - 基于 Vue 3 的组件库
- **图表库**: ECharts - 强大的数据可视化图表库
- **路由管理**: Vue Router - Vue.js 官方路由管理器
- **状态管理**: Pinia - Vue 的状态管理库
- **HTTP 客户端**: Axios - 基于 Promise 的 HTTP 客户端
- **样式预处理**: SCSS - CSS 预处理器

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
│   │   └── MainLayout.vue # 主布局组件
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── styles/            # 全局样式
│   │   └── main.scss      # 主样式文件
│   ├── views/             # 页面组件
│   │   ├── Dashboard.vue  # 仪表盘
│   │   ├── Charts.vue     # 图表管理
│   │   ├── Queries.vue    # 查询管理
│   │   ├── DataSources.vue # 数据源管理
│   │   ├── Templates.vue  # 模板管理
│   │   ├── Users.vue      # 用户管理
│   │   └── Login.vue      # 登录页面
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── public/                # 公共资源目录
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 主要功能模块

### 1. 仪表盘 (Dashboard)
- 系统概览和关键指标展示
- 数据统计和趋势分析
- 查询执行统计
- 热门查询排行

### 2. 查询管理 (Queries)
- 创建和编辑 SQL 查询
- 查询执行和结果预览
- 数据源关联管理
- 查询历史记录

### 3. 图表管理 (Charts)
- 创建和编辑多种类型图表
- 智能数据字段映射
- 图表样式和配置定制
- **图表预览和导出功能**
  - 实时图表预览
  - 一键导出为 PNG 图片
  - 支持图表打印
  - 高质量图片输出（2倍像素比率）

#### 支持的图表类型
- **柱状图**: 适合分类数据对比
- **折线图**: 适合趋势数据展示
- **饼图**: 适合占比数据展示
- **散点图**: 适合相关性分析
- **雷达图**: 适合多维度数据对比
- **热力图**: 适合矩阵数据展示
- **仪表盘**: 适合关键指标展示
- **漏斗图**: 适合流程转化分析

### 4. 数据源管理 (DataSources)
- 支持多种数据库类型
  - MySQL
  - PostgreSQL
  - SQLite
- 数据源连接配置
- 连接测试功能
- 权限控制（公开/私有）

### 5. 模板管理 (Templates)
- Excel 模板上传
- 模板分类管理
- 模板描述和版本控制

### 6. 用户管理 (Users)
- 用户账户管理
- 角色权限控制
- 密码重置功能

## 图表导出/打印功能详解

### 导出图片功能
- **使用方式**: 在图表预览弹窗中点击"导出图片"按钮
- **输出格式**: PNG 格式，支持透明背景
- **图片质量**: 2倍像素比率，确保高清晰度
- **文件命名**: 自动生成 `图表名称_时间戳.png` 格式
- **兼容性**: 支持所有图表类型

### 打印功能
- **使用方式**: 在图表预览弹窗中点击"打印"按钮
- **打印内容**: 图表图片 + 标题 + 打印时间
- **打印样式**: 优化的打印布局，自动居中显示
- **浏览器兼容**: 支持主流浏览器的打印功能

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 Vue 3 组合式 API 风格
- 使用 TypeScript 进行类型检查
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 提交规范
提交信息格式：
```
<type>(<scope>): <subject>

<body>

<footer>
```

type 类型：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建过程或辅助工具的变动

### 分支管理
- `main`: 主分支，用于生产环境
- `develop`: 开发分支，用于开发环境
- `feature/*`: 功能分支，用于开发新功能
- `hotfix/*`: 修复分支，用于修复生产环境的问题

## API 接口

### 图表相关接口
- `GET /api/charts` - 获取图表列表
- `POST /api/charts` - 创建图表
- `PUT /api/charts/:id` - 更新图表
- `DELETE /api/charts/:id` - 删除图表

### 查询相关接口
- `GET /api/queries` - 获取查询列表
- `POST /api/queries` - 创建查询
- `POST /api/queries/:id/execute` - 执行查询

### 数据源相关接口
- `GET /api/datasources` - 获取数据源列表
- `POST /api/datasources` - 创建数据源
- `PUT /api/datasources/:id` - 更新数据源

## 部署

1. 构建项目
```bash
npm run build
```

2. 部署 dist 目录到 Web 服务器

### 环境变量配置
```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:8080/api

# 生产环境
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## 浏览器兼容性

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 性能优化

- 使用 Vite 进行快速构建
- 图表按需加载
- 图片懒加载
- 组件懒加载
- 代码分割

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (git checkout -b feature/AmazingFeature)
3. 提交你的改动 (git commit -m 'Add some AmazingFeature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 开启一个 Pull Request

## 更新日志

### v1.1.0 (最新)
- ✨ 新增图表导出/打印功能
- 🎨 优化图表预览界面
- 🔧 改进数据字段自动适配
- 🐛 修复多种图表类型的渲染问题

### v1.0.0
- 🎉 初始版本发布
- 📊 基础图表功能
- 🔍 查询管理功能
- 👥 用户管理功能

## 联系方式

- 项目维护者：[sy-vendor]
- 邮箱：[sytourist@gmail.com]
- 项目地址：[GitHub Repository]

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。