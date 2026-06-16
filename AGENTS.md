<!-- BEGIN:package-manager-rules -->

# Package manager

This project uses Bun instead of npm. Prefer `bun` commands for installing dependencies, running scripts, and invoking package binaries:

- Use `bun install`, not `npm install`.
- Use `bun run <script>`, not `npm run <script>`.
- Use `bunx <package>`, not `npx <package>`.

Do not create or update npm lockfiles such as `package-lock.json`; keep Bun's lockfile as the source of truth.

<!-- END:package-manager-rules -->
