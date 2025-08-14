#!/usr/bin/env bash
set -euo pipefail
mkdir -p .changes
origin=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$origin" ]; then
  echo "No git origin found"; exit 1
fi
# owner/repo 추출
# https://github.com/owner/repo.git 형태에서 추출
owner=$(echo "$origin" | sed 's|.*/github.com/||' | sed 's|/.*||')
repo=$(echo "$origin" | sed 's|.*/||' | sed 's|\.git$||')
low_owner=$(echo "$owner" | tr "[:upper:]" "[:lower:]")
low_repo=$(echo "$repo" | tr "[:upper:]" "[:lower:]")
echo "$owner" > .changes/owner.txt
echo "$repo"  > .changes/repo.txt
echo "ghcr.io/${low_owner}/${low_repo}" > .changes/image_path.txt
echo "https://github.com/${owner}/${repo}/pkgs/container/${repo}" > .changes/ghcr_pkg_url.txt
printf "OWNER=%s\nREPO=%s\nIMAGE_PATH=%s\nPKG_URL=%s\n" \
  "$owner" "$repo" "$(cat .changes/image_path.txt)" "$(cat .changes/ghcr_pkg_url.txt)"