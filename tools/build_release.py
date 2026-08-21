#!/usr/bin/env python3
"""Build generated Bedrock assets and v1.0.0 .mcpack release files."""
from __future__ import annotations

import base64
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RP_DIR = ROOT / "resource_packs" / "InsaneWeatherRP"
BP_DIR = ROOT / "behavior_packs" / "InsaneWeatherBP"
RELEASE_DIR = ROOT / "releases" / "v1.0.0"
REMOTE_PNG = RP_DIR / "textures" / "items" / "weather_remote.png"
REMOTE_PNG_B64 = RP_DIR / "textures" / "items" / "weather_remote.png.base64"

PACKS = (
    (BP_DIR, RELEASE_DIR / "InsaneWeatherBP-v1.0.0.mcpack"),
    (RP_DIR, RELEASE_DIR / "InsaneWeatherRP-v1.0.0.mcpack"),
)


def decode_png() -> None:
    REMOTE_PNG.write_bytes(base64.b64decode(REMOTE_PNG_B64.read_text().strip()))


def zip_pack(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        target.unlink()

    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(source.rglob("*")):
            if not path.is_file():
                continue
            if path.suffix == ".base64":
                continue
            archive.write(path, path.relative_to(source))


def main() -> None:
    decode_png()
    for source, target in PACKS:
        zip_pack(source, target)
    print(f"Built release packs in {RELEASE_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
