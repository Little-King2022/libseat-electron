# LibSeat 约个座位 - 图书馆座位预约App

LibSeat 约个座位 基于 Electron 和 Vue.js 开发的跨平台图书馆座位预约桌面应用程序，提供便捷的自动预约、预约查询管理功能，帮助大家更好地使用图书馆座位资源。

## 主要功能

- 🔍 **座位查询 (Developing)**：快速查询座位状态和使用情况
- 📅 **一键预约 (Developing)**：支持一键预约图书馆座位
- 📊 **实时统计**：显示图书馆各楼层座位使用率、在馆人数等统计信息
![image](https://github.com/user-attachments/assets/d956ab5a-e4ca-4a4b-a834-6a7e5be52a3e)

- 📅 **自动预约**：创建自动预约任务，每天自动预约指定座位（最多支持5个候选列表）、查看预约程序日志、自动Cookie保活
![image](https://github.com/user-attachments/assets/72b8e641-2062-4cc4-810b-e81608c71d74)
![image](https://github.com/user-attachments/assets/168f59fc-2b21-4fd4-8d17-4b72d2f8a559)

- 📝 **预约记录**：查看历史预约记录和当前预约状态
![image](https://github.com/user-attachments/assets/1231b631-6adc-40b7-9083-98a9cf5d36a1)
![image](https://github.com/user-attachments/assets/f789a1e0-4aa8-417a-b110-bf8e275d3442)

- 🗺️ **座位分布**：提供图书馆座位分布图的查看功能
![image](https://github.com/user-attachments/assets/14cf0686-460f-4056-ba05-cdac95ad817c)

- 👤 **个人中心**：登录、查看账户信息
![image](https://github.com/user-attachments/assets/27390e26-9a5b-4198-9507-ad403800ba60)
![image](https://github.com/user-attachments/assets/01af13cc-398b-46aa-8be0-5ab321c79563)

- ⚙️ **系统设置**：自定义主题、更新图书馆楼层信息、座位列表数据库、设置自动预约开始时间
![image](https://github.com/user-attachments/assets/15752a9b-daea-40a9-a21c-6553462935c3)



## 技术栈

- **前端框架**：Vue 3 + Vite
- **桌面框架**：Electron
- **UI 组件**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **数据存储**：SQLite (better-sqlite3)
- **构建工具**：electron-builder

## 开发说明

### 开发环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 开发环境安装步骤

以下步骤仅适用于二次开发，用户请直接[下载安装包](https://github.com/Little-King2022/libseat-electron/releases/latest)使用


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
