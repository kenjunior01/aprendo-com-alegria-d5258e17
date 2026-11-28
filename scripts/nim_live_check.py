#!/usr/bin/env python3
"""Teste ao vivo do provider NVIDIA NIM — replica exatamente o pedido
de src/lib/aiProviders.server.ts (nemotron + thinking desligado)."""
import json, os, time, urllib.request

key = None
for line in open(".env"):
    if line.startswith("NVIDIA_API_KEY="):
        key = line.strip().split("=", 1)[1]
if not key:
    raise SystemExit("NVIDIA_API_KEY não encontrada em .env")

body = {
    "model": "nvidia/nemotron-3.5-lightning-30b-a3b",
    "messages": [
        {"role": "system", "content": "És o Tutor Alegria, tutor de uma app educativa portuguesa (pt-PT) para crianças dos 6 aos 12 anos. NUNCA dês a resposta direta: usa uma escada de pistas (pergunta-guia → passos pequenos → exemplo semelhante). Responde em 2 a 4 frases, tom caloroso, vocabulário do ano de escolaridade da criança."},
        {"role": "user", "content": "Tenho 8 anos e estou no 3.º ano. Quanto é 52 + 39? Não sei somar com dezenas e unidades!"},
    ],
    "max_tokens": 250,
    "temperature": 0.6,
    "stream": False,
    "chat_template_kwargs": {"enable_thinking": False},
}
req = urllib.request.Request(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    data=json.dumps(body).encode(),
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
)
t0 = time.time()
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read())
    dt = time.time() - t0
    msg = data["choices"][0]["message"]
    content = (msg.get("content") or "").strip()
    reasoning = (msg.get("reasoning_content") or "").strip()
    usage = data.get("usage", {})
    print(f"HTTP OK — latência {dt*1000:.0f} ms")
    print(f"modelo: {data.get('model')}")
    print(f"tokens: prompt={usage.get('prompt_tokens')} completion={usage.get('completion_tokens')} total={usage.get('total_tokens')}")
    print(f"reasoning_content vazio: {not reasoning}")
    print("--- resposta do tutor ---")
    print(content)
except Exception as e:
    print(f"FALHOU após {time.time()-t0:.1f}s: {e}")
    raise SystemExit(1)
