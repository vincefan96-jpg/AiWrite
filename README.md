# AI Write

AI 智能写作助手 — 基于 FastAPI + React 的全栈应用，集成 DeepSeek AI 提供文档润色、风格转换、翻译、摘要等写作辅助功能。

## 功能特性

- **AI 写作辅助**：文档润色、风格转换（正式/学术/商务/简洁）、多语言翻译、智能摘要
- **版本管理**：每次编辑自动保存历史版本，支持版本对比与一键恢复
- **富文本编辑器**：基于 TipTap (ProseMirror) 的所见即所得编辑器
- **用户系统**：JWT 认证（access + refresh token），注册/登录
- **Docker 部署**：前端 + 后端 + PostgreSQL 一键编排

## 技术栈

| 层 | 技术 |
|---|---|
| 后端框架 | FastAPI (Python) |
| 数据库 ORM | SQLAlchemy 2.0 (async) |
| 数据库 | PostgreSQL 16 |
| 认证 | JWT (python-jose) + bcrypt |
| AI 接口 | DeepSeek API (OpenAI 兼容协议) |
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 样式 | Tailwind CSS 3 |
| 编辑器 | TipTap 3 |
| 状态管理 | Zustand |

## 项目结构

```
AiWrite/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/             # 路由：auth, documents, writing
│   │   ├── core/            # 配置、数据库、安全
│   │   ├── models/          # SQLAlchemy 模型
│   │   ├── schemas/         # Pydantic 请求/响应模型
│   │   └── services/        # AI 调用、写作服务
│   ├── requirements.txt
│   └── run.py               # 入口（Windows 兼容）
├── frontend/                # React 前端
│   └── src/
│       ├── components/      # 组件：Auth, Editor, Layout, VersionHistory
│       ├── pages/           # 页面：Login, Register, Dashboard, Editor
│       ├── hooks/           # useAuth, useDocuments
│       ├── services/        # Axios API 封装
│       ├── store/           # Zustand 状态管理
│       └── types/           # TypeScript 类型定义
└── docker-compose.yml       # Docker 编排
```

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 20+
- PostgreSQL 16+

### 1. 克隆项目

```bash
git clone https://github.com/vincefan96-jpg/AiWrite.git
cd AiWrite
```

### 2. 后端配置

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 复制并编辑环境变量
cp .env.example .env
```

编辑 `backend/.env`，填入以下必要配置：

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `JWT_SECRET` | JWT 签名密钥（随机字符串） |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |

### 3. 启动后端

```bash
# Windows 必须用 run.py（事件循环兼容）
python run.py
```

后端运行在 `http://127.0.0.1:8000`，健康检查：`GET /api/health`

### 4. 前端配置

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`

### 5. Docker 部署（可选）

```bash
# 设置环境变量
export POSTGRES_PASSWORD=your_password
export JWT_SECRET=your_secret
export DEEPSEEK_API_KEY=your_api_key

docker compose up -d
```

前端暴露端口 `${FRONTEND_PORT:-3000}`，默认 `http://localhost:3000`

## API 概览

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| GET | `/api/documents` | 文档列表 |
| POST | `/api/documents` | 创建文档 |
| GET | `/api/documents/{id}` | 获取文档 |
| PUT | `/api/documents/{id}` | 更新文档 |
| DELETE | `/api/documents/{id}` | 删除文档 |
| POST | `/api/writing/polish` | AI 润色 |
| POST | `/api/writing/style-convert` | 风格转换 |
| POST | `/api/writing/translate` | 翻译 |
| POST | `/api/writing/summarize` | 摘要 |
| GET | `/api/writing/versions/{document_id}` | 版本历史 |
| POST | `/api/writing/restore` | 恢复版本 |

## 许可证

MIT
