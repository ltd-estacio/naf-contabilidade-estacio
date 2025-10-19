const fs = require('fs')
const path = require('path')

const cwd = process.cwd()
const sourceDir = path.join(cwd, 'public', 'playwright-aws-lambda', 'bin')
const targetDir = path.join(cwd, 'playwright-bin')

if (!fs.existsSync(sourceDir)) {
  console.error('Source directory not found:', sourceDir)
  process.exit(0)
}

fs.mkdirSync(targetDir, { recursive: true })

for (const file of fs.readdirSync(sourceDir)) {
  const src = path.join(sourceDir, file)
  const dest = path.join(targetDir, file)
  fs.copyFileSync(src, dest)
}
