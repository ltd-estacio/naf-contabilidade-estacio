const fs = require('fs')
const path = require('path')

function ensureBrowsersJson() {
  const root = path.join(__dirname, '..')
  const coreDir = path.join(root, 'node_modules', 'playwright-core')

  if (!fs.existsSync(coreDir)) {
    return
  }

  const targetPath = path.join(coreDir, 'browsers.json')
  if (fs.existsSync(targetPath)) {
    return
  }

  let revisions = {}
  try {
    const pkg = require(path.join(coreDir, 'package.json'))
    if (pkg && typeof pkg.playwright === 'object' && pkg.playwright) {
      const { chromium_revision, firefox_revision, webkit_revision } = pkg.playwright
      revisions = {
        chromium: chromium_revision,
        firefox: firefox_revision,
        webkit: webkit_revision,
      }
    }
  } catch (error) {
    // ignore package metadata errors
  }

  const payload = {
    browsers: Object.entries(revisions).reduce((acc, [engine, revision]) => {
      if (!revision) return acc
      acc[engine] = { revision }
      return acc
    }, {}),
    generatedAt: new Date().toISOString(),
    note: 'Synthetic metadata to satisfy Next.js tracing when using playwright-aws-lambda',
  }

  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), 'utf-8')
}

ensureBrowsersJson()
