"""Génère les variantes web de la photo de profil.

Usage : python scripts/optimize-photo.py
Lit ressources/photo pro.jpg (non versionnée) et écrit src/assets/photo-<largeur>.{avif,webp}.
"""

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "ressources" / "photo pro.jpg"
OUT = ROOT / "src" / "assets"
WIDTHS = (160, 320, 480)

# Recadrage buste (ratio 3:4), centré horizontalement sur le visage.
CROP_LEFT, CROP_RIGHT, CROP_TOP = 0.19, 0.81, 0.06


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    image = ImageOps.exif_transpose(Image.open(SOURCE)).convert("RGB")
    w, h = image.size
    left, right = round(w * CROP_LEFT), round(w * CROP_RIGHT)
    top = round(h * CROP_TOP)
    bottom = top + round((right - left) * 4 / 3)
    portrait = image.crop((left, top, right, bottom))

    for width in WIDTHS:
        resized = portrait.resize((width, round(width * 4 / 3)), Image.LANCZOS)
        resized.save(OUT / f"photo-{width}.avif", quality=55)
        resized.save(OUT / f"photo-{width}.webp", quality=78, method=6)

    for file in sorted(OUT.glob("photo-*")):
        print(f"{file.name}: {file.stat().st_size / 1024:.1f} Ko")


if __name__ == "__main__":
    main()
