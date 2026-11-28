#!/usr/bin/env python3
"""Gera manifestos de chunks dos ficheiros alterados vs origin/main
(exclui package-lock.json — o remoto já tem as deps NVIDIA)."""
import subprocess, os

os.chdir("/home/z/my-project/repo-aprendo")
OUT = "/tmp/chunks"
subprocess.run(["rm", "-rf", OUT], check=True)
os.makedirs(OUT, exist_ok=True)

files = subprocess.run(
    ["git", "diff", "--name-only", "origin/main..HEAD"],
    capture_output=True, text=True, check=True,
).stdout.split()
files = [f for f in files if f != "package-lock.json" and os.path.isfile(f)]

MAX_BYTES = 140_000
chunks, cur, size = [], [], 0
for f in files:
    fs = os.path.getsize(f)
    if cur and size + fs > MAX_BYTES:
        chunks.append(cur)
        cur, size = [], 0
    cur.append(f)
    size += fs
if cur:
    chunks.append(cur)

total = 0
for i, chunk in enumerate(chunks, 1):
    b = sum(os.path.getsize(f) for f in chunk)
    total += b
    with open(f"{OUT}/chunk-{i:02d}.txt", "w") as fh:
        fh.write("\n".join(chunk))
    print(f"chunk-{i:02d}: {len(chunk)} ficheiros, {b:,} bytes")
print(f"TOTAL: {len(files)} ficheiros, {total:,} bytes em {len(chunks)} chunks")
