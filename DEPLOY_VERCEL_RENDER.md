# 小羊与小猪 部署说明

这份说明对应当前项目的免费部署方案：

- 前端：Vercel
- 后端：Render
- 数据库：Neon 或 Supabase Postgres

## 1. 先准备账号

- GitHub
- Vercel
- Render
- Neon 或 Supabase

## 2. 数据库

创建一个 Postgres 数据库，拿到连接串：

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

推荐：

- Neon：免费额度更适合个人项目
- Supabase：免费额度也够个人站使用

## 3. 部署后端到 Render

### 基本配置

- New Web Service
- 连接你的 GitHub 仓库
- Root Directory: `Kirameku-backend`
- Runtime: `Python`
- Build Command:

```bash
pip install -r requirements.txt
```

- Start Command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 后端环境变量

至少配置这些：

```env
DATABASE_URL=你的 Postgres 连接串
SECRET_KEY=随便生成一串足够长的随机字符串
CORS_ORIGINS=https://你的-vercel-域名.vercel.app,http://localhost:3000
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET_NAME=
OSS_ENDPOINT=
OSS_CUSTOM_DOMAIN=
OSS_PREFIX=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

说明：

- 先不配 OSS 也能启动，但后台图片上传会不可用
- 先不配 GitHub OAuth 也能启动，只是 GitHub 登录不可用

### 管理后台

当前后端代码会在 `Kirameku-backend/admin/dist` 存在时自动挂载 `/admin`。

如果你需要后台页面一起上线，需要先在本地构建 admin：

```bash
cd Kirameku-backend/admin
npm install
npm run build
```

构建完成后确认 `Kirameku-backend/admin/dist` 已生成，再提交到仓库。

## 4. 部署前端到 Vercel

### 基本配置

- New Project
- 连接同一个 GitHub 仓库
- Root Directory: `Kirameku`
- Framework Preset: `Next.js`

### 前端环境变量

```env
BACKEND_URL=https://你的-render-服务.onrender.com
NEXT_PUBLIC_SITE_URL=https://你的-vercel-域名.vercel.app
NOVEL_API_URL=
NEXT_PUBLIC_NOVEL_API_URL=
```

说明：

- `BACKEND_URL` 是服务端请求和 rewrites 用的
- `NEXT_PUBLIC_SITE_URL` 用于站点 URL、RSS、分享链接
- 小说功能不用就留空

## 5. 部署顺序

推荐顺序：

1. 先部署数据库
2. 再部署 Render 后端
3. 确认后端健康检查可访问：

```text
https://你的-render-服务.onrender.com/api/health
```

4. 最后部署 Vercel 前端

## 6. 上线后检查

至少检查这几个地址：

- 前端首页 `/`
- 关于页 `/about`
- 杂记 `/posts`
- 碎碎念 `/moments`
- 后端健康检查 `/api/health`
- 后台 `/admin`（如果你构建并提交了 `admin/dist`）

## 7. 当前已做的部署适配

当前代码已经改成：

- 前端 API 和 RSS 支持读取 `BACKEND_URL`
- 站点 URL 支持读取 `NEXT_PUBLIC_SITE_URL`
- 后端未配置 OSS 时不会在启动阶段直接报错
- CORS 默认不再写死原作者域名

## 8. 当前仍需你自己准备的东西

- GitHub 仓库推送
- Vercel / Render / 数据库账号
- `SECRET_KEY`
- 数据库连接串
- 是否启用 OSS 图片上传
- 是否构建并提交后台 `admin/dist`
