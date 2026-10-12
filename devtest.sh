#!/usr/bin/env bash
# devtest.sh — serve o build de produção em :8080 para testes E2E com browser.
cd /home/z/my-project/repo-aprendo || exit 1
# Mata instâncias anteriores
pkill -f "vite preview" 2>/dev/null
sleep 1
nohup npx vite preview --port 8080 --strictPort > /tmp/vite-preview.log 2>&1 &
sleep 4
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8080/
