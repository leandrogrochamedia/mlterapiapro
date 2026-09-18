#!/usr/bin/env python3
"""Configura git e faz push pro GitHub."""
import subprocess, sys, os
from pathlib import Path

ROOT = Path("/Users/leandrogrocha/Documents/DEV/MARILAND/ml-projeto")

GITHUB_USER = "leandrogrocha"
GITHUB_REPO = "ml-terapia-pro"
BRANCH      = "main"
COMMIT_MSG  = "feat: setup inicial do ML Terapia Pro"

SUPABASE_URL      = "https://aaqyhcpuwkifaeplxdep.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_1gVxSsEOUPcEswKTFqQY2w_D2Lwxl5b"

GITIGNORE = """# Backups locais
_backups/

# Python
.venv/
venv/
__pycache__/
*.pyc
*.pyo

# Node
node_modules/

# SO / Editor
.DS_Store
Thumbs.db
.vscode/
.idea/
*.swp

# Logs / temp
*.log
tmp/
temp/
"""

README_MD = """# ML Terapia Pro

Sistema de gestao clinica para terapeutas, psicologos e coaches.

## Estrutura

- index.html — Splash com blur/unblur
- Login-v2.html — Login + cadastro
- onboarding.html — Cadastro de terapeuta
- dashboard-v2.html — Dashboard principal (SPA)
- Quiz.html — Teste publico de travas
- images/ — Logo e assets
- config.js — Credenciais Supabase

## Setup

1. Rode: python3 -m http.server 8000
2. Acesse http://localhost:8000
"""

CONFIG_EXAMPLE = (
    "// config.example.js\n"
    "// Copie para config.js e preencha.\n"
    "\n"
    "window.SUPABASE_URL      = '" + SUPABASE_URL + "';\n"
    "window.SUPABASE_ANON_KEY = '" + SUPABASE_ANON_KEY + "';\n"
)


def run(cmd, check=True, capture=False):
    print("  $ " + " ".join(cmd))
    try:
        r = subprocess.run(cmd, cwd=ROOT, check=check,
                           capture_output=capture, text=True)
        return r.stdout.strip() if capture else None
    except subprocess.CalledProcessError as e:
        print("  Falhou: " + str(e))
        if check: sys.exit(1)
        return None


def write_file(path, content, overwrite=False):
    p = ROOT / path
    if p.exists() and not overwrite:
        print("  - " + path + " ja existe (pulando)")
        return
    p.write_text(content, encoding="utf-8")
    print("  + " + path + " criado")


def section(t):
    print("\n" + "=" * 60)
    print("  " + t)
    print("=" * 60)


def main():
    os.chdir(ROOT)

    section("1) Criando arquivos")
    write_file(".gitignore", GITIGNORE)
    write_file("config.example.js", CONFIG_EXAMPLE, overwrite=True)
    write_file("README.md", README_MD, overwrite=True)

    section("2) Verificando git")
    v = run(["git", "--version"], capture=True, check=False)
    if not v:
        print("git nao instalado. Rode: xcode-select --install")
        sys.exit(1)
    print("  OK: " + v)

    section("3) Init repositorio")
    if not (ROOT / ".git").exists():
        run(["git", "init"])
        run(["git", "branch", "-M", BRANCH])
    else:
        print("  .git ja existe")

    if not run(["git", "config", "user.name"], capture=True, check=False):
        run(["git", "config", "user.name", "Leandro Rocha"])
    if not run(["git", "config", "user.email"], capture=True, check=False):
        run(["git", "config", "user.email", "leandrogrocha@users.noreply.github.com"])

    section("4) Add arquivos")
    run(["git", "add", "."])
    st = run(["git", "status", "--short"], capture=True, check=False)
    print("")
    print("  Arquivos que vao pro commit:")
    for line in (st or "").splitlines():
        print("    " + line)

    section("5) Commit")
    if run(["git", "rev-parse", "HEAD"], capture=True, check=False):
        print("  ja tem commit (pulando)")
    else:
        run(["git", "commit", "-m", COMMIT_MSG])

    section("6) Remote GitHub")
    url = "https://github.com/" + GITHUB_USER + "/" + GITHUB_REPO + ".git"
    cur = run(["git", "remote", "get-url", "origin"], capture=True, check=False)
    if cur:
        print("  origin atual: " + cur)
        if cur != url:
            run(["git", "remote", "set-url", "origin", url])
    else:
        run(["git", "remote", "add", "origin", url])

    section("7) Push")
    print("  (Se pedir senha: use TOKEN do GitHub)")
    run(["git", "push", "-u", "origin", BRANCH], check=False)

    print("\n" + "=" * 60)
    print("  PRONTO: https://github.com/" + GITHUB_USER + "/" + GITHUB_REPO)
    print("=" * 60)


if __name__ == "__main__":
    main()