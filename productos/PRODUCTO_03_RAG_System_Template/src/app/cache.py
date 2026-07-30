from __future__ import annotations

import hashlib
import json
import pickle
from pathlib import Path
from typing import Any, Optional

import diskcache
from loguru import logger

from app.config import settings

_redis_client: Any = None
_disk_cache: diskcache.Cache | None = None


def _get_disk_cache() -> diskcache.Cache:
    global _disk_cache
    if _disk_cache is None:
        path = Path("data/cache/embeddings")
        path.mkdir(parents=True, exist_ok=True)
        _disk_cache = diskcache.Cache(str(path))
    return _disk_cache


def _get_redis_client() -> Any:
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        import redis.asyncio as aioredis

        _redis_client = aioredis.from_url(
            settings.redis_url, decode_responses=False
        )
        logger.info("Connected to Redis cache")
    except Exception as exc:
        logger.warning(f"Redis unavailable, falling back to disk cache: {exc}")
        _redis_client = None
    return _redis_client


def _make_key(text: str, model: str) -> str:
    raw = f"{model}::{text}"
    return hashlib.sha256(raw.encode()).hexdigest()


async def get_embedding_cache(text: str, model: str) -> Optional[list[float]]:
    key = _make_key(text, model)
    if settings.cache_backend == "redis":
        client = _get_redis_client()
        if client is not None:
            try:
                data = await client.get(key)
                if data:
                    return pickle.loads(data)
            except Exception:
                pass
    disk = _get_disk_cache()
    val = disk.get(key)
    if val is not None:
        return pickle.loads(val) if isinstance(val, bytes) else val
    return None


async def set_embedding_cache(
    text: str, model: str, embedding: list[float]
) -> None:
    key = _make_key(text, model)
    blob = pickle.dumps(embedding)
    if settings.cache_backend == "redis":
        client = _get_redis_client()
        if client is not None:
            try:
                await client.setex(key, 86400, blob)
                return
            except Exception:
                pass
    _get_disk_cache().set(key, blob, expire=86400)


async def clear_cache() -> int:
    cleared = 0
    if settings.cache_backend == "redis":
        client = _get_redis_client()
        if client is not None:
            try:
                cleared = await client.flushdb()
            except Exception:
                pass
    _get_disk_cache().clear()
    return cleared
