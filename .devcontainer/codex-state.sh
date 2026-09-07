#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
state_dir=/home/node/.codex
backup_dir="$repo_dir/.local-backups/codex"
archive="$backup_dir/state.tar.gz"

case "${1:-}" in
  backup)
    # Stop Codex first: SQLite databases and their WAL files must be copied together.
    if [ "${CODEX_STATE_STOPPED:-}" != yes ]; then
      echo 'Close/disable Codex first, then run: CODEX_STATE_STOPPED=yes bash .devcontainer/codex-state.sh backup' >&2
      exit 1
    fi
    test -d "$state_dir"
    umask 077
    mkdir -p "$backup_dir"
    if [ -e "$archive" ]; then
      echo "Backup already exists: $archive. Move it to a safe location before making another." >&2
      exit 1
    fi
    tar --exclude='./ipc' --exclude='./tmp' --exclude='./.tmp' \
      --exclude='./thread-writer-locks' --exclude='./mcp-oauth-locks' \
      -czf "$archive.partial" -C "$state_dir" .
    tar -tzf "$archive.partial" >/dev/null
    mv "$archive.partial" "$archive"
    echo "Backup verified: $archive"
    ;;
  restore)
    sudo mkdir -p "$state_dir"
    sudo chown "$(id -u):$(id -g)" "$state_dir"
    chmod 700 "$state_dir"
    if [ -n "$(find "$state_dir" -mindepth 1 -maxdepth 1 -print -quit)" ]; then
      echo 'Codex storage already contains data; leaving it untouched.'
      exit 0
    fi
    if [ ! -f "$archive" ]; then
      echo 'No Codex backup found; persistent storage is ready for a new session.'
      exit 0
    fi
    tar -xzf "$archive" --no-same-owner -C "$state_dir"
    echo 'Codex state restored into persistent storage.'
    ;;
  *)
    echo 'Usage: bash .devcontainer/codex-state.sh backup|restore' >&2
    exit 1
    ;;
esac
