const path = require('path')
const typescript = require('@rollup/plugin-typescript')
const { terser } = require('rollup-plugin-terser')

const workDir = process.env.INIT_CWD
const indexPath = path.join(workDir, 'src', 'index.ts')
const tscPath = path.join(workDir, 'tsconfig.json')
const tsconfig = require(tscPath)
const formats = ['umd', 'esm']
const umdTsPlugin = typescript({
  tsconfig: tscPath
})
const esmTsPlugin = typescript({
  compilerOptions: {
    ...tsconfig.compilerOptions,
    target: 'esnext'
  }
})
const terserPlugin = [terser()]

function getOutputPath (type) {
  return path.join(workDir, `dist/index.${type}.js`)
}

/**
 * @param {string} name
 * @return {import('rollup').RollupOptions[]}
 */
module.exports.getRollupConfig = function getRollupConfig (name) {
  return formats.map((format) => {
    const tsPlugin = format === 'esm' ? esmTsPlugin : umdTsPlugin
    return {
      input: indexPath,
      output: [format, `${format}.min`].map((type) => {
        return {
          name,
          format,
          file: getOutputPath(type),
          plugins: type.indexOf('.min') > 0 ? terserPlugin : []
        }
      }),
      plugins: [tsPlugin, terserPlugin]
    }
  })
}