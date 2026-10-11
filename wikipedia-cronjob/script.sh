#!/bin/sh
set -e

RAW_URL=$(curl -sI https://en.wikipedia.org/wiki/Special:Random | grep -i '^location:' | awk '{print $2}' | tr -d '\r')

case "$RAW_URL" in
  //*) URL="https:$RAW_URL" ;;
  http*) URL="$RAW_URL" ;;
  *) URL="https://en.wikipedia.org$RAW_URL" ;;
esac

echo "Formatted Wikipedia URL: $URL"

# Added --max-time 10 to prevent hanging
curl -X POST --max-time 10 -H "Content-Type: application/json" -d "{\"todo\": \"Read $URL\"}" http://todo-backend-svc:2345/todos

echo -e "\nSuccessfully injected Wikipedia todo"
