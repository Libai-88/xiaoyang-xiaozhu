from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request

from app.config import CORS_ORIGINS
from app.database import init_db
from app.api import api_router

# 公共只读接口的短时缓存：仅缓存匿名 GET 的静态内容，
# 带 Authorization 的请求（管理后台）与用户生成内容（说说/留言/评论）一律不缓存
_CACHEABLE_PREFIXES = (
    "/api/posts",
    "/api/categories",
    "/api/tags",
    "/api/albums",
    "/api/friend-links",
    "/api/site-config",
    "/api/projects",
    "/api/bookmarks",
)


def _is_cacheable_path(path: str) -> bool:
    return any(path == p or path.startswith(p + "/") for p in _CACHEABLE_PREFIXES)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Kirameku Backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def cache_public_reads(request: Request, call_next):
    response = await call_next(request)
    if (
        request.method in ("GET", "HEAD")
        and response.status_code < 400
        and "authorization" not in request.headers
        and _is_cacheable_path(request.url.path)
    ):
        response.headers["Cache-Control"] = "public, max-age=120"
    return response


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    return response

# 一行挂载所有 API 路由
app.include_router(api_router)

# 挂载上传文件目录
uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# 挂载 Vue 管理后台
admin_root = Path(__file__).resolve().parent.parent / "admin"
admin_build = admin_root / "build"
admin_dist = admin_root / "dist"
if admin_dist.exists():
    app.mount("/admin", StaticFiles(directory=str(admin_dist), html=True), name="admin")
elif admin_build.exists():
    app.mount("/admin", StaticFiles(directory=str(admin_build), html=True), name="admin")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/routes")
def get_routes():
    return {"code": 0, "message": "success", "data": []}
