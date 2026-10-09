#!/bin/sh
set -e

# 1. Fetch redirect location from Wikipedia
RAW_URL=$(curl -sI https://en.wikipedia.org/wiki/Special:Random | grep -i '^location:' | awk '{print $2}' | tr -d '\r')

# 2. Prepend https: if Wikipedia returned a protocol-relative URL (starting with //)
case "$RAW_URL" in
  //*) URL="https:$RAW_URL" ;;
  http*) URL="$RAW_URL" ;;
  *) URL="https://en.wikipedia.org$RAW_URL" ;;
esac

echo "Formatted Wikipedia URL: $URL"

# 3. Post to backend via Service Port 2345
curl -X POST -H "Content-Type: application/json" -d "{\"todo\": \"Read $URL\"}" http://todo-backend-svc:2345/todos

echo -e "\nSuccessfully injected Wikipedia todo"
