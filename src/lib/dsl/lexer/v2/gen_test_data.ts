import {getCurrentDir} from '@logi/base/ts/spreadjs/bazel'
import {readdirSync, readFileSync, writeFileSync} from 'fs'
import {join} from 'path'

import {Error} from './error'
import {lex} from './lexer'
import {toToksText} from './test_utils'
import {Token} from './token'

/**
 * The relative generated path of the test data via the project path.
 */
const PROJ_OUTPUT = 'test_data'
const OUTPUT_DIR = join(getCurrentDir(__dirname), PROJ_OUTPUT)
/**
 * The generator source input files path.
 */
const SOURCES_PATH = join(__dirname, 'test_data')
const SOURCES = readdirSync(SOURCES_PATH)
    .filter((m: string) => m.endsWith('.txt'))
SOURCES.forEach((s: string) => {
    const txt = readFileSync(join(SOURCES_PATH, s), 'utf-8')
    const tokenParts: (readonly (Token | Error)[])[] = []
    // tslint:disable-next-line: max-func-body-length
    txt.split('\n').forEach((t: string) => {
        if (t.startsWith('#') || t.match(/^ +$/) || t === '')
            return
        const originalTokens = lex(t.replace(/^'/g, '').replace(/'$/g, ''))
        tokenParts.push(originalTokens)
    })
    const name = s.replace(/\.txt$/g, '')
    const outFile = join(OUTPUT_DIR, name + '.toks')
    writeFileSync(outFile, toToksText(tokenParts))
    // tslint:disable-next-line:no-console
    console.log(`Generate ${outFile} successfully`)
})
