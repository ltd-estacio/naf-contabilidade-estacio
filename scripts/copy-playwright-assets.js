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

  const args = new Set(process.argv.slice(2))
  const destinations = []

  if (args.size === 0 || args.has('pre')) {
    destinations.push(path.join(cwd, 'public', 'playwright-aws-lambda', 'bin'))
  }

  if (args.size === 0 || args.has('post')) {
    destinations.push(path.join(cwd, '.next', 'server', 'playwright-aws-lambda', 'bin'))
  }

  const files = fs.readdirSync(srcDir)
  for (const file of files) {
    const srcPath = path.join(srcDir, file)
    for (const destRoot of destinations) {
      const destPath = path.join(destRoot, file)
      ensureDirectory(destPath)
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

copyLambdaBin()
