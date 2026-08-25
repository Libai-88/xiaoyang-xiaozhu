import json
import time
from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models import SiteConfig
from app.schemas import SiteConfigUpdate

# 站点配置内存缓存（公开接口每次页面加载都会读取，TTL 60s 内命中缓存）
_CONFIG_CACHE_TTL = 60
_config_cache: dict[str, any] | None = None
_config_cache_ts = 0.0


def _invalidate_config_cache():
    global _config_cache, _config_cache_ts
    _config_cache = None
    _config_cache_ts = 0.0


def get_all_config(session: Session) -> dict[str, any]:
    """返回所有配置的 key-value 字典（带短时缓存）。"""
    global _config_cache, _config_cache_ts
    now = time.time()
    if _config_cache is not None and now - _config_cache_ts < _CONFIG_CACHE_TTL:
        return _config_cache

    rows = list(session.exec(select(SiteConfig)).all())
    result = {}
    for r in rows:
        try:
            result[r.key] = json.loads(r.value)
        except (json.JSONDecodeError, TypeError):
            result[r.key] = r.value
    _config_cache = result
    _config_cache_ts = now
    return result


def get_all_config_list(session: Session) -> list[dict]:
    """返回所有配置的完整列表（含 id、description、updated_at）。"""
    rows = list(session.exec(select(SiteConfig).order_by(SiteConfig.id)).all())
    return [
        {
            "id": r.id,
            "key": r.key,
            "value": r.value,
            "description": r.description or "",
            "updated_at": r.updated_at.isoformat() if r.updated_at else "",
        }
        for r in rows
    ]


def create_config(session: Session, key: str, value: str, description: str = "") -> SiteConfig:
    """新建配置项。"""
    existing = session.exec(select(SiteConfig).where(SiteConfig.key == key)).first()
    if existing:
        raise HTTPException(400, f"配置 {key} 已存在")
    row = SiteConfig(key=key, value=value, description=description)
    session.add(row)
    session.commit()
    session.refresh(row)
    _invalidate_config_cache()
    return row


def delete_config(session: Session, key: str):
    """删除配置项。"""
    row = session.exec(select(SiteConfig).where(SiteConfig.key == key)).first()
    if not row:
        raise HTTPException(404, f"配置 {key} 不存在")
    session.delete(row)
    session.commit()
    _invalidate_config_cache()


def get_config(session: Session, key: str) -> any:
    row = session.exec(select(SiteConfig).where(SiteConfig.key == key)).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"配置 {key} 不存在")
    try:
        return json.loads(row.value)
    except (json.JSONDecodeError, TypeError):
        return row.value


def update_config(session: Session, key: str, data: SiteConfigUpdate) -> SiteConfig:
    row = session.exec(select(SiteConfig).where(SiteConfig.key == key)).first()
    if not row:
        row = SiteConfig(key=key, value=data.value, description=data.description)
    else:
        row.value = data.value
        if data.description:
            row.description = data.description
    row.updated_at = datetime.now()
    session.add(row)
    session.commit()
    session.refresh(row)
    _invalidate_config_cache()
    return row


def batch_update_config(session: Session, configs: dict[str, str]) -> dict:
    """批量更新配置。"""
    for key, value in configs.items():
        row = session.exec(select(SiteConfig).where(SiteConfig.key == key)).first()
        if not row:
            row = SiteConfig(key=key, value=json.dumps(value, ensure_ascii=False))
        else:
            row.value = json.dumps(value, ensure_ascii=False)
        row.updated_at = datetime.now()
        session.add(row)
    session.commit()
    _invalidate_config_cache()
    return get_all_config(session)
