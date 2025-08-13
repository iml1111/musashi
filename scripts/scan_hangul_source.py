import sys, json, re, os, pathlib
PATTERN = re.compile(r'[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]')
EXCLUDES = [
  ".git", "node_modules", ".venv", "venv", ".mypy_cache", ".ruff_cache",
  "dist", "build", ".next", ".cache", "__pycache__", ".pytest_cache",
  "*.lock", "*.min.*", "*.map", "*.svg", "*.png", "*.jpg", "*.jpeg", "*.webp",
  "*.ico", "*.pdf", "*.woff*", "*.ttf", "*.otf", "*.bin", "*.class", "*.jar",
  "*.snap", "*.golden", "coverage*", ".DS_Store",
  "artifacts", "korean_strings.json", "translation-map.json", "translate*.py", "enhanced*.py"
]
def excluded(path):
    p = str(path)
    for ex in EXCLUDES:
        if ex.startswith("*."):
            if p.endswith(ex[1:]): return True
        elif ex in p.split(os.sep): return True
        elif p.endswith(ex): return True
    # Also exclude any translation-related files
    if "translate" in p.lower() or "korean" in p.lower() or "translation" in p.lower():
        return True
    return False

rows=[]
root=pathlib.Path(".").resolve()
for path in root.rglob("*"):
    if path.is_file() and not excluded(path):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for i, line in enumerate(text.splitlines(), 1):
            if PATTERN.search(line):
                rows.append({"path": str(path), "line": i, "text": line.strip()[:400]})
out = {"count": len(rows), "rows": rows}
print(f"Found {out['count']} Korean strings in source files")