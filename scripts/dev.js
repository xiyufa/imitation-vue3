const { build } = require('esbuild')

const args = require('minimist')(process.argv.slice(2))  // node scripts/dev.js reactivity -f global
const { resolve } = require('path')

const target = args._[0] || 'reactivity'
const format = args.f || 'global'

const pkg = require = require(resolve(__dirname, `../packages/${target}/package.json`))

// iife 立即执行函数
// cjs node 中的模块
// esm 浏览器中的esModule模块
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'

const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  bundle: true,
  sourcemap: true,
  format: outputFormat,
  globalName: pkg.buildOption?.name,
  platform: format === 'cjs' ? 'none' : 'browser',
  watch: {
    onRebuild(error) {
      if (!error) console.log(`rebuild~~~`)
    }
  }
}).then(() => {
  console.log('watching~~~')
})



