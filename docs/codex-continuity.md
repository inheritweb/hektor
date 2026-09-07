# Codex continuity across container rebuilds

Codex state is mounted at `/home/node/.codex` using the Docker named volume
`hektor-codex-state`. This is a mount managed by the host Docker daemon which
creates the dev container, not by Docker-in-Docker running Supabase.

## First rebuild: migrate existing state

1. Save all work. In VS Code, disable the Codex extension for this workspace
   and reload the window if prompted. Close any Codex CLI processes too. Keep
   the dev container running; use an ordinary terminal inside it for the backup.
2. From `/workspace`, run:

   ```sh
   CODEX_STATE_STOPPED=yes bash .devcontainer/codex-state.sh backup
   ```

   Wait for `Backup verified`. The archive includes credentials, SQLite state
   and session files. Stopping Codex ensures database files and WALs are copied
   consistently. The archive is private and ignored by Git. Do not upload it.

3. Use **Dev Containers: Rebuild Container**. The post-create script restores
   the archive into the new volume before installing dependencies. It refuses
   to overwrite any existing state. Look for the restore message in setup logs.
4. Re-enable Codex, reload if needed, and reopen this conversation. Confirm
   the history is available. Keep the backup until you have verified recovery.

If setup reports that storage already contains data, it has skipped restoration.
Do not delete that state: inspect it before choosing how to merge or recover it.
The restore command can also be run manually while Codex is stopped.

## Subsequent rebuilds

The same named volume is reused. Do not remove it with Docker volume cleanup
or `docker compose down -v`. A volume survives container replacement, but is
not a backup against host disk failure. Keep private backups outside Docker.

Persisted conversations do not preserve an executing agent process or prevent
context compaction. Keep project decisions in repository documentation as well.
For the current design discussion, read `docs/learning-experiences-design.md`.
