"""Configuration loader — YAML file + environment variable override."""

from __future__ import annotations

import os
import yaml
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class ProviderSettings(BaseModel):
    api_key: str = ""
    model: str = "gpt-4o"
    base_url: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 4096


class MemorySettings(BaseModel):
    backend: str = "inmemory"
    ttl_seconds: int = 3600
    redis_url: str = "redis://localhost:6379/0"


class LoggingSettings(BaseModel):
    level: str = "INFO"
    format: str = "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s"
    output: str = "console"


class AgentSettings(BaseModel):
    max_retries: int = 3
    timeout_seconds: int = 120
    human_in_the_loop: bool = True


class PipelineSettings(BaseSettings):
    providers: Dict[str, ProviderSettings] = Field(default_factory=lambda: {
        "openai": ProviderSettings(model="gpt-4o"),
        "anthropic": ProviderSettings(model="claude-sonnet-4-20250514"),
        "gemini": ProviderSettings(model="gemini-2.5-flash-001"),
        "ollama": ProviderSettings(model="llama3.3", base_url="http://localhost:11434/v1"),
    })
    default_provider: str = "openai"
    memory: MemorySettings = MemorySettings()
    logging: LoggingSettings = LoggingSettings()
    agent: AgentSettings = AgentSettings()
    plugins: List[str] = Field(default_factory=list)
    config_path: Optional[str] = None

    class Config:
        env_prefix = "PIPELINE_"
        env_nested_delimiter = "__"


def load_config(path: Optional[str] = None) -> PipelineSettings:
    cfg = PipelineSettings()

    if path is None:
        path = os.environ.get("PIPELINE_CONFIG_PATH", "")

    if path:
        p = Path(path)
        if p.is_file():
            with open(p, encoding="utf-8") as f:
                raw = yaml.safe_load(f) or {}
            cfg = _merge_yaml(cfg, raw)

    overrides = _env_overrides()
    if overrides:
        _deep_merge(cfg, overrides)

    _inject_api_keys(cfg)
    return cfg


def _merge_yaml(base: PipelineSettings, raw: dict) -> PipelineSettings:
    providers = base.providers.copy()
    if "providers" in raw:
        for name, opts in raw["providers"].items():
            if name in providers:
                providers[name] = providers[name].model_copy(update=opts)
            else:
                providers[name] = ProviderSettings(**opts)
    raw["providers"] = providers

    for section in ("memory", "logging", "agent"):
        if section in raw and hasattr(base, section):
            current = getattr(base, section)
            raw[section] = current.model_copy(update=raw[section])

    return base.model_copy(update=raw)


def _env_overrides() -> dict:
    overrides: dict = {}
    for key, val in os.environ.items():
        if not key.startswith("PIPELINE_"):
            continue
        parts = key.lower().replace("pipeline_", "", 1).split("__")
        target = overrides
        for p in parts[:-1]:
            target = target.setdefault(p, {})
        target[parts[-1]] = val
    return overrides


def _deep_merge(cfg: PipelineSettings, overrides: dict) -> None:
    for section, vals in overrides.items():
        if not hasattr(cfg, section):
            continue
        current = getattr(cfg, section)
        if isinstance(current, BaseModel):
            d = current.model_dump()
            for k, v in vals.items():
                if k in d:
                    d[k] = v
            setattr(cfg, section, current.__class__(**d))
        elif isinstance(current, dict):
            current.update(vals)


def _inject_api_keys(cfg: PipelineSettings) -> None:
    for provider in cfg.providers.values():
        if not provider.api_key:
            provider.api_key = os.environ.get(
                f"{provider.model.split('-')[0].upper()}_API_KEY", ""
            )

    providers = cfg.providers
    if not providers["openai"].api_key:
        providers["openai"].api_key = os.environ.get("OPENAI_API_KEY", "")
    if not providers["anthropic"].api_key:
        providers["anthropic"].api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not providers["gemini"].api_key:
        providers["gemini"].api_key = os.environ.get("GEMINI_API_KEY", "")
