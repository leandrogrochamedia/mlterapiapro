#!/usr/bin/env python3
"""
upload_foto.py — Redimensiona e salva foto do terapeuta no banco (base64).

Uso:
    python3 upload_foto.py foto.jpg
    python3 upload_foto.py foto.jpg --slug mariland-rodrigues
    python3 upload_foto.py                  # modo interativo
"""

import os
import sys
import base64
import argparse
from io import BytesIO
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from supabase import create_client
from PIL import Image, ImageOps

# Credenciais (default — sobrescritas pelo .env se existir)
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://aaqyhcpuwkifaeplxdep.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or "sb_publishable_1gVxSsEOUPcEswKTFqQY2w_D2Lwxl5b"
SLUG_PADRAO  = "mariland-rodrigues"
TAMANHO_PADRAO = 240
QUALIDADE_PADRAO = 85


def redimensionar_para_base64(caminho: Path, tamanho=240, qualidade=85):
    img = Image.open(caminho)
    img = ImageOps.exif_transpose(img)

    if img.mode in ("RGBA", "LA", "P"):
        fundo = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        fundo.paste(img, mask=img.split()[-1])
        img = fundo
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img = ImageOps.fit(img, (tamanho, tamanho), method=Image.LANCZOS, centering=(0.5, 0.4))

    buf = BytesIO()
    img.save(buf, format="JPEG", quality=qualidade, optimize=True)
    dados = buf.getvalue()

    b64 = base64.b64encode(dados).decode("ascii")
    return f"data:image/jpeg;base64,{b64}", len(dados)


def salvar_no_banco(slug: str, data_url: str):
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    return sb.table("terapeutas").update({"foto": data_url}).eq("slug", slug).execute()


def main():
    parser = argparse.ArgumentParser(description="Salva a foto do terapeuta como base64")
    parser.add_argument("imagem", nargs="?", help="Caminho da imagem (jpg/png/gif/heic)")
    parser.add_argument("--slug", default=SLUG_PADRAO)
    parser.add_argument("--tamanho", type=int, default=TAMANHO_PADRAO)
    parser.add_argument("--qualidade", type=int, default=QUALIDADE_PADRAO)
    args = parser.parse_args()

    caminho = args.imagem or input("📷 Caminho da imagem: ").strip().strip("'\"")
    p = Path(caminho).expanduser()
    if not p.exists():
        print(f"❌ Arquivo não encontrado: {p}")
        sys.exit(1)

    print(f"📷 Lendo {p.name} ({p.stat().st_size // 1024} KB)...")
    data_url, tamanho_bytes = redimensionar_para_base64(p, args.tamanho, args.qualidade)
    print(f"✅ Redimensionada → {args.tamanho}x{args.tamanho} JPEG q{args.qualidade}")
    print(f"   Arquivo: {tamanho_bytes // 1024} KB · Base64: {len(data_url) // 1024} KB")

    res = salvar_no_banco(args.slug, data_url)
    if getattr(res, "data", None):
        print(f"✅ Foto salva em terapeutas.slug = '{args.slug}'")
    else:
        print(f"⚠  Nada retornado. O slug '{args.slug}' existe?")


if __name__ == "__main__":
    main()