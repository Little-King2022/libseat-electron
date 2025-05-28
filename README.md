# LibSeat 图书馆座位预约桌面应用

LibSeat 是一个基于 Electron 和 Vue.js 开发的跨平台图书馆座位预约桌面应用程序。它提供了便捷的座位预约管理功能，帮助学生更好地使用图书馆资源。

## 主要功能

- 🔍 **座位查询**：快速查询座位状态和使用情况
- 📅 **一键预约 (Developing)**：支持一键预约图书馆座位
- 📊 **实时统计**：显示图书馆各楼层座位使用率、在馆人数等统计信息
![image](https://github.com/user-attachments/assets/3bb6c0ed-318a-40d7-b428-bddded330ce7)

- 📅 **自动预约 (Developing)**：支持设置自动预约任务，每天自动为用户预约指定座位
![image](https://github.com/user-attachments/assets/56182515-e611-4010-839c-15767a6473b9)

- 📝 **预约记录**：查看历史预约记录和当前预约状态
![image](https://github.com/user-attachments/assets/80c242be-1f05-4f5c-86e9-9e2a42b148a7)
![image](https://github.com/user-attachments/assets/5dba3529-0f89-41ba-99c8-9e8238569fb6)

- 🗺️ **座位分布**：提供图书馆座位分布图的查看功能
![image](https://github.com/user-attachments/assets/14cf0686-460f-4056-ba05-cdac95ad817c)

- 👤 **个人中心**：登录、查看账户信息
![image](https://github.com/user-attachments/assets/27390e26-9a5b-4198-9507-ad403800ba60)
![image](https://github.com/user-attachments/assets/2e17ca56-53a6-43bd-aab1-3af5029751c1)

- ⚙️ **系统设置**：自定义主题、更新图书馆楼层信息、座位列表数据库

## 技术栈

- **前端框架**：Vue 3 + Vite
- **桌面框架**：Electron
- **UI 组件**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **数据存储**：SQLite (better-sqlite3)
- **构建工具**：electron-builder

## 安装说明

### 开发环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/Little-King2022/libseat-electron.git
cd libseat-electron
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建应用
```bash
npm run build
```

## 项目结构

```
libseat-electron/
├── assets/              # 静态资源
├── electron/           # Electron 主进程代码
│   ├── api.js         # API 接口
│   ├── database/      # 数据库相关
│   └── services/      # 业务服务
├── src/               # 渲染进程源代码
│   ├── components/    # Vue 组件
│   ├── views/         # 页面视图
│   ├── router/        # 路由配置
│   ├── stores/        # Pinia 状态管理
│   └── utils/         # 工具函数
└── public/            # 静态公共资源
```

## 开发指南

- 主进程代码位于 `electron/` 目录
- 渲染进程代码位于 `src/` 目录
- 使用 `npm run dev` 启动开发服务器
- 使用 `npm run build` 构建生产版本

## 贡献指南

欢迎提交 Issue 和 Pull Request。在提交 PR 之前，请确保代码符合项目的编码规范，并提供必要的说明

## 许可证

[MIT License](LICENSE)

## 联系作者

Little-King <littleking2024@gmail.com>
