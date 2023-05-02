import { copyFile, rm } from 'fs/promises'
import { defineBuildConfig } from 'unbuild'
import { resolve } from 'pathe'

export default defineBuildConfig({
  entries: [
    'src/index'
  ],
  rollup: { emitCJS: true },
  declaration: true,
  hooks: {
    async 'rollup:done' (ctx) {
      const outDir = ctx.options.outDir
      await copyFile(resolve(outDir, 'index.cjs'), resolve(outDir, 'devalue.js'))
      await rm(resolve(outDir, 'index.cjs'))

      await copyFile(resolve(outDir, 'index.mjs'), resolve(outDir, 'devalue.mjs'))
      await rm(resolve(outDir, 'index.mjs'))
    }
  }
})
