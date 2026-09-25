#!/bin/bash
# Downloads the trained VQA model checkpoint from the GitHub Release
# and places it at the repo root, where the Dockerfile expects it.

set -e

RELEASE_URL="https://github.com/aatefnsn/VQA_one_repo/releases/download/model-v1/checkpoint_17_Ahmed_768_new.pth.tar"
OUTPUT_FILE="checkpoint_17_Ahmed_768_new.pth.tar"

echo "Downloading model checkpoint from GitHub Release..."
curl -fL --progress-bar "$RELEASE_URL" -o "$OUTPUT_FILE"

echo "✓ Downloaded $(du -h "$OUTPUT_FILE" | cut -f1) to $OUTPUT_FILE"
