#!/usr/bin/env python3
"""
Generate depth maps for the Farmish journey scenes.

Reads the scene images listed in src/lib/journeyStore.ts, runs Depth Anything V2
on each one, and writes grayscale WebP depth maps to public/depth/<scene-id>.webp
(white = near, black = far) -- exactly what SceneCanvas.tsx expects.

Setup (once):
    python3 -m venv .venv && source .venv/bin/activate
    pip install torch transformers pillow numpy

Usage (from the project root):
    python3 scripts/generate_depth.py                 # all scenes
    python3 scripts/generate_depth.py --only harvest  # one scene
    python3 scripts/generate_depth.py --dry-run       # list what would be processed
    python3 scripts/generate_depth.py --model depth-anything/Depth-Anything-V2-Base-hf

The first run downloads the model (~100 MB for Small). Re-run it whenever you
replace a scene image so the depth map stays aligned with the photo.
"""
from __future__ import annotations

import argparse
import re
import sys
import urllib.request
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORE = ROOT / "src" / "lib" / "journeyStore.ts"
PUBLIC = ROOT / "public"


def parse_scenes(source: str) -> dict[str, str]:
    """Return {scene_id: image_url_or_public_path} parsed from journeyStore.ts."""
    imgs_block = re.search(r"export const IMGS = \{(.*?)\n\};", source, re.S)
    if not imgs_block:
        sys.exit("Could not find the IMGS block in journeyStore.ts")
    imgs = dict(re.findall(r'(\w+):\s*"([^"]+)"', imgs_block.group(1)))

    scenes: dict[str, str] = {}
    for scene_id, ref in re.findall(r'id:\s*"(\w+)",\s*\n\s*img:\s*IMGS\.(\w+),', source):
        if ref not in imgs:
            sys.exit(f"Scene '{scene_id}' references unknown image IMGS.{ref}")
        scenes[scene_id] = imgs[ref]
    if not scenes:
        sys.exit("No scenes found in journeyStore.ts")
    return scenes


def load_image(location: str):
    from PIL import Image

    if location.startswith(("http://", "https://")):
        req = urllib.request.Request(location, headers={"User-Agent": "farmish-depth/1.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            return Image.open(BytesIO(resp.read())).convert("RGB")
    local = PUBLIC / location.lstrip("/")
    if not local.exists():
        sys.exit(f"Local image not found: {local}")
    return Image.open(local).convert("RGB")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", action="append", help="Scene id to process (repeatable)")
    ap.add_argument("--model", default="depth-anything/Depth-Anything-V2-Small-hf")
    ap.add_argument("--max-size", type=int, default=1024, help="Longest side of the output map in px")
    ap.add_argument("--blur", type=float, default=1.2, help="Gaussian blur radius to hide stair-stepping")
    ap.add_argument("--out", type=Path, default=PUBLIC / "depth")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    scenes = parse_scenes(STORE.read_text())
    if args.only:
        missing = set(args.only) - set(scenes)
        if missing:
            sys.exit(f"Unknown scene id(s): {', '.join(sorted(missing))}. Available: {', '.join(scenes)}")
        scenes = {k: v for k, v in scenes.items() if k in args.only}

    if args.dry_run:
        for scene_id, loc in scenes.items():
            print(f"{scene_id:10s} <- {loc}")
        return

    import numpy as np
    import torch
    from PIL import Image, ImageFilter
    from transformers import pipeline

    device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Loading {args.model} on {device} ...")
    estimator = pipeline("depth-estimation", model=args.model, device=device)

    args.out.mkdir(parents=True, exist_ok=True)
    for scene_id, loc in scenes.items():
        print(f"[{scene_id}] {loc}")
        img = load_image(loc)

        result = estimator(img)
        depth = result["predicted_depth"]
        depth = torch.nn.functional.interpolate(
            depth.reshape(1, 1, *depth.shape[-2:]).float(),
            size=img.size[::-1],
            mode="bicubic",
            align_corners=False,
        ).squeeze().cpu().numpy()

        # Robust normalisation: ignore outliers so one extreme pixel can't flatten the map
        lo, hi = np.percentile(depth, [2, 98])
        depth = np.clip((depth - lo) / max(hi - lo, 1e-6), 0.0, 1.0)

        out = Image.fromarray((depth * 255).astype(np.uint8), mode="L")
        if args.blur > 0:
            out = out.filter(ImageFilter.GaussianBlur(args.blur))
        scale = args.max_size / max(out.size)
        if scale < 1:
            out = out.resize((round(out.width * scale), round(out.height * scale)), Image.LANCZOS)

        dest = args.out / f"{scene_id}.webp"
        out.save(dest, "WEBP", quality=90)
        print(f"    -> {dest.relative_to(ROOT)} ({out.width}x{out.height}, {dest.stat().st_size // 1024} KB)")

    print("Done. Reload the site: scenes with a depth map now get parallax.")


if __name__ == "__main__":
    main()