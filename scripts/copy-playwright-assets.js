const fs = require('fs')
const path = require('path')

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function copyLambdaBin() {
  const cwd = process.cwd()
  const srcDir = path.join(cwd, 'node_modules', 'playwright-aws-lambda', 'dist', 'src', 'bin')
  if (!fs.existsSync(srcDir)) {
    return
  }

  const outDir = path.join(cwd, '.next', 'server', 'playwright-aws-lambda', 'bin')
  const files = fs.readdirSync(srcDir)
  for (const file of files) {
    const srcPath = path.join(srcDir, file)
    const destPath = path.join(outDir, file)
    ensureDirectory(destPath)
    fs.copyFileSync(srcPath, destPath)
  }
}

copyLambdaBin()
