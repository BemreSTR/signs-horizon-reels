#!/usr/bin/env bash
# Usage: tools/render.sh E015   -> out/E015_silent.mp4 (video only). Then: python3 tools/master.py E015
set -euo pipefail
COMP=${1:?composition id}
mkdir -p out
# Chrome: CHROME ortam değişkeniyle ver (ör. export CHROME=/usr/bin/google-chrome); yoksa Playwright'ın headless shell'i aranır
CHROME=${CHROME:-$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell ~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}
[ -n "$CHROME" ] || { echo "Chrome bulunamadı: export CHROME=/yol/chrome (bkz. README Kurulum)"; exit 1; }
npx remotion render src/index.ts "$COMP" "out/${COMP}_silent.mp4" \
  --browser-executable="$CHROME" --port=3456 --codec=h264 --crf=20 --x264-preset=medium \
  --pixel-format=yuv420p --color-space=bt709 --concurrency=1 --public-dir=public
