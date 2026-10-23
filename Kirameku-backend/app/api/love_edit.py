"""情侣空间内容在线编辑接口

流程：校验管理密码 → 通过 GitHub Contents API 修改前端源码
`Kirameku/data/love.ts` 并推送 → Vercel 检测到新 commit 自动重建 →
「网站上改内容，约 1 分钟全站生效」。

需要配置的环境变量（Render 后端服务 Environment）：
- ADMIN_PASSWORD：管理密码（必填，前端编辑面板输入此密码）
- GITHUB_TOKEN：GitHub Personal Access Token（仓库 Contents 读写权限）
- GITHUB_OWNER / GITHUB_REPO：仓库归属（默认 Libai-88 / xiaoyang-xiaozhu）
"""

import base64
import json
import os
import re
from typing import Optional

import httpx
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from app.config import ADMIN_PASSWORD

router = APIRouter(prefix="/api/love", tags=["情侣空间编辑"])

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
GITHUB_OWNER = os.getenv("GITHUB_OWNER", "Libai-88").strip()
GITHUB_REPO = os.getenv("GITHUB_REPO", "xiaoyang-xiaozhu").strip()
LOVE_TS_PATH = "Kirameku/data/love.ts"
GITHUB_API = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/{LOVE_TS_PATH}"


# ---------- 请求体 ----------

class EventUpdate(BaseModel):
    id: str
    date: str = ""


class LetterUpdate(BaseModel):
    days: int
    content: str = ""


class PlaceUpdate(BaseModel):
    id: str = ""
    name: str
    lat: float = 0.0
    lng: float = 0.0
    note: str = ""
    emoji: str = "📍"


class EditPayload(BaseModel):
    events: Optional[list[EventUpdate]] = None
    wishlist: Optional[list[str]] = None
    letters: Optional[list[LetterUpdate]] = None
    password: Optional[str] = None
    places: Optional[list[PlaceUpdate]] = None


# ---------- 基础校验 ----------

def _check_password(pwd: Optional[str]):
    if not ADMIN_PASSWORD:
        raise HTTPException(503, "服务端未配置 ADMIN_PASSWORD 管理密码，请先在 Render 环境变量中添加")
    if pwd != ADMIN_PASSWORD:
        raise HTTPException(401, "管理密码错误")


def _require_token():
    if not GITHUB_TOKEN:
        raise HTTPException(503, "服务端未配置 GITHUB_TOKEN，请先在 Render 环境变量中添加")


def _ts_str(value: str) -> str:
    """把字符串转成合法的 TS 字符串字面量（双引号与反斜杠转义与 JSON 一致）"""
    return json.dumps(value, ensure_ascii=False)


def _ts_escape(value: str) -> str:
    """只转义字符串内容（不包引号），供模板已自带引号的情况使用"""
    return (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t")
    )


def _decode_ts(raw: str) -> str:
    """把 TS 字符串字面量内容（转义形式）还原为原始文本"""
    try:
        return json.loads('"' + raw + '"')
    except Exception:
        return raw


# TS 字符串内容匹配：允许反斜杠转义序列（\\、\"、\n 等）
_Q = r'(?:[^"\\]|\\.)*'


# ---------- GitHub 读写 ----------

def _get_love_ts() -> tuple[str, str]:
    """拉取 love.ts 当前内容与 blob sha"""
    _require_token()
    resp = httpx.get(
        GITHUB_API,
        headers={"Authorization": f"Bearer {GITHUB_TOKEN}", "Accept": "application/vnd.github+json"},
        timeout=20,
    )
    if resp.status_code != 200:
        raise HTTPException(502, f"读取仓库文件失败：HTTP {resp.status_code} {resp.text[:200]}")
    data = resp.json()
    content = base64.b64decode(data["content"]).decode("utf-8")
    return content, data["sha"]


def _push_love_ts(content: str, sha: str, message: str) -> str:
    """把修改后的 love.ts 推回仓库，返回新 commit sha"""
    _require_token()
    resp = httpx.put(
        GITHUB_API,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
        },
        json={
            "message": message,
            "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
            "sha": sha,
        },
        timeout=25,
    )
    if resp.status_code not in (200, 201):
        raise HTTPException(502, f"推送失败：HTTP {resp.status_code} {resp.text[:300]}")
    return resp.json()["commit"]["sha"]


# ---------- 锚点替换（只改被点名的块，其余原样保留） ----------

def _replace_event_date(content: str, event_id: str, date: str) -> str:
    pattern = re.compile(
        r'(\{\s*id:\s*"' + re.escape(event_id) + r'",\s*name:\s*"' + _Q
        + r'",\s*emoji:\s*"' + _Q + r'",\s*date:\s*")' + _Q + r'(")'
    )
    new_content, n = pattern.subn(lambda m: m.group(1) + _ts_escape(date) + m.group(2), content, count=1)
    if n == 0:
        raise HTTPException(400, f"找不到纪念事件 id={event_id}，请检查 data/love.ts 是否被手动改动")
    return new_content


def _replace_wishlist(content: str, items: list[str]) -> str:
    rows = "".join(f'  {_ts_str(item)},\n' for item in items)
    new_block = f"export const WISHLIST_DEFAULT: string[] = [\n{rows}];"
    pattern = re.compile(r"export const WISHLIST_DEFAULT: string\[\] = \[[\s\S]*?\];")
    new_content, n = pattern.subn(new_block, content, count=1)
    if n == 0:
        raise HTTPException(400, "找不到 WISHLIST_DEFAULT，请检查 data/love.ts 是否被手动改动")
    return new_content


def _replace_letter(content: str, days: int, text: str) -> str:
    pattern = re.compile(
        r'(\{\s*days:\s*' + str(days) + r',\s*emoji:\s*"' + _Q
        + r'",\s*title:\s*"' + _Q + r'",\s*content:\s*")' + _Q + r'(")'
    )
    new_content, n = pattern.subn(lambda m: m.group(1) + _ts_escape(text) + m.group(2), content, count=1)
    if n == 0:
        raise HTTPException(400, f"找不到第 {days} 天的信件，请检查 data/love.ts 是否被手动改动")
    return new_content


def _replace_password(content: str, pwd: str) -> str:
    pattern = re.compile(r'(SECRET_PASSWORD\s*=\s*")' + _Q + r'(")')
    new_content, n = pattern.subn(lambda m: m.group(1) + _ts_escape(pwd) + m.group(2), content, count=1)
    if n == 0:
        raise HTTPException(400, "找不到 SECRET_PASSWORD，请检查 data/love.ts 是否被手动改动")
    return new_content


def _replace_places(content: str, places: list[PlaceUpdate]) -> str:
    rows = []
    for p in places:
        pid = p.id or p.name
        rows.append(
            "  { "
            f"id: {_ts_str(pid)}, name: {_ts_str(p.name)}, "
            f"lat: {p.lat}, lng: {p.lng}, "
            f"note: {_ts_str(p.note)}, emoji: {_ts_str(p.emoji or '📍')}"
            " },"
        )
    new_block = "export const MAP_PLACES_INIT = [\n" + "\n".join(rows) + "\n];"
    pattern = re.compile(r"export const MAP_PLACES_INIT = \[[\s\S]*?\];")
    new_content, n = pattern.subn(new_block, content, count=1)
    if n == 0:
        raise HTTPException(400, "找不到 MAP_PLACES_INIT，请检查 data/love.ts 是否被手动改动")
    return new_content


# ---------- 读取当前内容（供前端表单预填） ----------

def _extract_current(content: str) -> dict:
    events = []
    for m in re.finditer(
        r'id:\s*"(' + _Q + r')",\s*name:\s*"(' + _Q + r')",\s*emoji:\s*"(' + _Q + r')",\s*date:\s*"(' + _Q + r')"',
        content,
    ):
        events.append({
            "id": _decode_ts(m.group(1)),
            "name": _decode_ts(m.group(2)),
            "emoji": _decode_ts(m.group(3)),
            "date": _decode_ts(m.group(4)),
        })

    wishlist: list[str] = []
    wm = re.search(r"WISHLIST_DEFAULT: string\[\] = \[([\s\S]*?)\];", content)
    if wm:
        for line in re.findall(r'^\s*("' + _Q + r'"),\s*$', wm.group(1), re.M):
            wishlist.append(_decode_ts(line))

    letters = []
    for m in re.finditer(
        r'days:\s*(\d+),\s*emoji:\s*"(' + _Q + r')",\s*title:\s*"(' + _Q + r')",\s*content:\s*"(' + _Q + r')"',
        content,
    ):
        letters.append({
            "days": int(m.group(1)),
            "title": _decode_ts(m.group(3)),
            "content": _decode_ts(m.group(4)),
        })

    pw = re.search(r'SECRET_PASSWORD\s*=\s*"(' + _Q + r')"', content)
    password = _decode_ts(pw.group(1)) if pw else ""

    places = []
    pm = re.search(r"MAP_PLACES_INIT = \[([\s\S]*?)\];", content)
    if pm:
        for m in re.finditer(
            r'id:\s*"(' + _Q + r')",\s*name:\s*"(' + _Q + r')",\s*lat:\s*([\d.-]+),\s*lng:\s*([\d.-]+),\s*note:\s*"('
            + _Q + r')",\s*emoji:\s*"(' + _Q + r')"',
            pm.group(1),
        ):
            places.append({
                "id": _decode_ts(m.group(1)),
                "name": _decode_ts(m.group(2)),
                "lat": float(m.group(3)),
                "lng": float(m.group(4)),
                "note": _decode_ts(m.group(5)),
                "emoji": _decode_ts(m.group(6)),
            })

    return {"events": events, "wishlist": wishlist, "letters": letters, "password": password, "places": places}


# ---------- 路由 ----------

@router.get("/content")
def get_love_content(x_admin_password: Optional[str] = Header(default=None)):
    """读取当前情侣空间内容（需管理密码）"""
    _check_password(x_admin_password)
    content, _ = _get_love_ts()
    return {"code": 0, "data": _extract_current(content)}


@router.post("/edit")
def edit_love_content(payload: EditPayload, x_admin_password: Optional[str] = Header(default=None)):
    """保存情侣空间内容：改 love.ts 并推送 GitHub，触发 Vercel 重建"""
    _check_password(x_admin_password)

    content, sha = _get_love_ts()
    changes: list[str] = []

    if payload.events is not None:
        for e in payload.events:
            content = _replace_event_date(content, e.id, e.date or "")
        changes.append("纪念日")

    if payload.wishlist is not None:
        content = _replace_wishlist(content, payload.wishlist)
        changes.append("愿望清单")

    if payload.letters is not None:
        for l in payload.letters:
            content = _replace_letter(content, l.days, l.content or "")
        changes.append("里程碑信件")

    if payload.password is not None:
        content = _replace_password(content, payload.password)
        changes.append("悄悄话密码")

    if payload.places is not None:
        content = _replace_places(content, payload.places)
        changes.append("足迹地图")

    if not changes:
        raise HTTPException(400, "没有需要更新的内容")

    new_sha = _push_love_ts(
        content,
        sha,
        "feat: 站内编辑情侣空间（" + "、".join(changes) + "）",
    )
    return {
        "code": 0,
        "message": "已提交！约 1 分钟后全站生效",
        "data": {"sha": new_sha, "changed": changes},
    }
