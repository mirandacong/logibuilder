/* eslint-disable indent */
import {getWorkspace} from '@logi-base/src/ts/node/bazel'
import {ArgumentParser} from 'argparse'
import {writeFileSync} from 'fs'

import {getUsage, UsageArg, UsageFunc} from './usage'

/**
 * Use for diff test.
 */
const TEST_OUTPUT = 'func_usage.remarkup'

/**
 * Use for generate the golden file.
 */
const GOLDEN_OUTPUT = 'src/lib/dsl/semantic/est/operator/func_usage.md'

/**
 * Generate remarkup format file that used in phabricator.
 * This file shows the usage for all the logi function.
 * Modification in function signature in registry will cause diff with the
 * `func_usage.golden` file.
 */
function main(): void {
    const parser = new ArgumentParser()
    parser.addArgument('--test', {defaultValue: false, nargs: 0})
    const args = parser.parseArgs()
    const content = genRemarkupFile()
    if (args.test)
        writeFileSync(TEST_OUTPUT, content, 'utf-8')
    else
        writeFileSync(GOLDEN_OUTPUT, content, 'utf-8')
}

main()

function genRemarkupFile(): string {
    const usage = getUsage()
    return `
# Logi.Builder函数使用说明

## 目录

- [行计算型函数](#行计算型函数)
${usage.rowType
    .map((s: UsageFunc, idx: number): string =>
            `  - [${s.name}](#a${idx})`)
    .join('\n')}
- [列计算型函数](#列计算型函数)
${usage.colType
    .map((s: UsageFunc, idx: number): string =>
            `  - [${s.name}](#b${idx})`)
    .join('\n')}

## 行计算型函数

${usage.rowType
    .map((f: UsageFunc, i: number): string => genUsage(f, i, true))
    .join('\n\n')}

## 列计算型函数

${usage.colType
    .map((f: UsageFunc, i: number): string => genUsage(f, i, false))
    .join('\n\n')}
`
}

function genUsage(s: UsageFunc, idx: number, isRowType: boolean): string {
    return `
> ${s.name} <span id='${isRowType ? 'a' : 'b'}${idx}'>

- 函数描述

    ${s.description}

- 参数信息

${buildArgsInfo(s.args)}

- 返回值类型

    **${s.returnType}**

- 示例

    ${s.example}
`.trim()
}

function buildArgsInfo(args: readonly UsageArg[]): string {
    if (args.length === 0)
        return '    无参数'
    return `  |参数名|参数类型|可重复|可选|参数描述|
  |---|---|---|---|---|
${args
    .map((a: UsageArg): string => {
        const items: string[] = [
            a.name,
            a.types,
            a.repeated ? '✔️' : '❌',
            a.optional ? '✔️' : '❌',
            a.description,
        ]
        return `  |${items.join('|')}|`
        // let str = ''
        // str += `|${a.name}|`
        // str += `|${a.types}|`
        // str += `<td>${a.repeated ? '✔️' : '❌'}</td>`
        // str += `<td>${a.optional ? '✔️' : '❌'}</td>`
        // str += `<td>${a.description}</td>`
        // str += '</tr>'
        // return str
    })
    .join('\n')}`
}
