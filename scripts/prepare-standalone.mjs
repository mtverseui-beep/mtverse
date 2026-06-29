import { cpSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const standaloneDir = path.join(root, '.next', 'standalone')

if (!existsSync(standaloneDir)) {
  throw new Error('Next standalone output was not found. Check next.config.ts output configuration.')
}

function copyIfPresent(source, destination) {
  if (!existsSync(source)) return

  mkdirSync(path.dirname(destination), { recursive: true })
  cpSync(source, destination, { recursive: true, force: true })
}

copyIfPresent(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'))
copyIfPresent(path.join(root, 'public'), path.join(standaloneDir, 'public'))