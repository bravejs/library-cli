const fs = require('fs')
const path = require('path')

const workDir = process.env.INIT_CWD

const defaultPackage = {
  name: 'my-library',
  version: '0.0.1',
  description: 'BraveJS library',
  main: 'dist/index.umd.js',
  module: 'dist/index.esm.js',
  unpkg: 'dist/index.umd.min.js',
  types: 'dist/index.d.ts',
  files: [
    'dist'
  ],
  scripts: {
    build: 'rm -rf dist && rollup -c'
  }
}

const defaultTsconfig = {
  compilerOptions: {
    module: 'esnext',
    target: 'es5',
    sourceMap: false,
    strict: true,
    declaration: true,
    declarationDir: '.',
    moduleResolution: 'Node',
  },
  exclude: [
    'node_modules'
  ]
}

const defaultGitignore = [
  'node_modules',
  'dist',
  '.DS_Store',
  '.tmp',
  '.idea',
  '.vscode',
  '*.log'
]

function readFile (filePath) {
  const content = fs.readFileSync(filePath).toString()
  return /\.json$/.test(filePath) ? JSON.parse(content) : content
}

function writeFile (filePath, content, updater) {
  if (updater && fs.existsSync(filePath)) {
    content = updater(readFile(filePath))
  }
  if (typeof content === 'object') {
    if (Array.isArray(content)) {
      content = content.join('\n')
    } else {
      content = JSON.stringify(content, null, 2)
    }
  }
  fs.writeFileSync(filePath, content)
}

function merge (a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return Array.from(new Set(a.concat(b)))
  }
  return { ...a, ...b }
}

function setPackage () {
  writeFile(path.join(workDir, 'package.json'), defaultPackage, (pkg) => {
    for (let key in defaultPackage) {
      const defaultValue = defaultPackage[key]
      let value = pkg[key]
      if (value) {
        switch (key) {
          case 'files':
          case 'scripts': {
            value = merge(value, defaultValue)
            break
          }
        }
      } else {
        pkg[key] = defaultValue
      }
    }
    return pkg
  })
}

function setTsconfig () {
  writeFile(path.join(workDir, 'tsconfig.json'), defaultTsconfig, (tsc) => {
    for (let key in defaultTsconfig) {
      const value = tsc[key]
      if (value) {
        tsc[key] = merge(value, defaultTsconfig[key])
      }
    }
    return tsc
  })
}

function setGitignore () {
  writeFile(path.join(workDir, '.gitignore'), defaultGitignore, (ignore) => {
    return merge(ignore.split('\n'), defaultGitignore)
  })
}

function setRollupConfig () {
  const filePath = path.join(workDir, 'rollup.config.js')
  if (!fs.existsSync(filePath)) {
    writeFile(filePath, [
      `import { getRollupConfig } from '@bravejs/library-cli'\n`,
      `export default getRollupConfig('MyLibrary')\n`,
    ])
  }
}

function setIndex () {
  const srcDir = path.join(workDir, 'src')
  const indexPath = path.join(srcDir, 'index.ts')
  if (!fs.existsSync(indexPath)) {
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir)
    }
    writeFile(indexPath, `export default 'Hello world!'`)
  }
}

setPackage()
setTsconfig()
setGitignore()
setIndex()
setRollupConfig()