#!/usr/bin/env bash
set -euo pipefail

# Get repository name in format owner/repo
name=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || git remote get-url origin | sed -E "s#.*/([^/]+/[^/.]+)(\.git)?$#\1#")

# Convert to lowercase for GHCR
image_path="ghcr.io/$(echo "$name" | tr "[:upper:]" "[:lower:]")"

# Create .changes directory if it doesn't exist
mkdir -p .changes

# Save to file
echo "$image_path" > .changes/image_path.txt

# Output for visibility
echo "IMAGE_PATH=$image_path"