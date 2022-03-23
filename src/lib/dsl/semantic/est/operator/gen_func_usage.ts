import {getPlatform, Platform} from '@logi/base/ts/common/platform'
import {getWorkspace} from '@logi/base/ts/spreadjs/bazel'
import {ArgumentParser} from 'argparse'
import {writeFileSync} from 'fs'
import {join} from 'path'

import {getUsage, UsageArg, UsageFunc} from './usage'

/**
 * Use for diff test.
 */
const TEST_OUTPUT = 'func_usage.remarkup'

/**
 * Use for generate the golden file.
 */
const GOLDEN_OUTPUT = join(
    getWorkspace(),
    'src/lib/dsl/semantic/est/operator/func_usage.golden',
)

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

if (getPlatform() !== Platform.NODEJS || require?.main === module)
    main()

function genRemarkupFile(): string {
    const usage = getUsage()
    return `
= Logi.Builder函数使用说明

== 目录

- [[#a | 行计算型函数]]
${usage.rowType
    .map((s: UsageFunc, idx: number): string =>
    `-- [[#a${idx} | ${s.name}]]`)
    .join('\n')}
- [[#b | 列计算型函数]]
${usage.colType
    .map((s: UsageFunc, idx: number): string =>
    `-- [[#b${idx} | ${s.name}]]`)
    .join('\n')}

== 行计算型函数 {anchor #a}

${usage.rowType
    .map((f: UsageFunc, i: number): string => genUsage(f, i, true))
    .join('\n\n')}

== 列计算型函数 {anchor #b}

${usage.colType
    .map((f: UsageFunc, i: number): string => genUsage(f, i, false))
    .join('\n\n')}
`
}

function genUsage(s: UsageFunc, idx: number, isRowType: boolean): string {
    return `
(NOTE) ${s.name}{anchor #${isRowType ? 'a' : 'b'}${idx}}

- 函数描述

    ${s.description}

- 参数信息

${buildArgsInfo(s.args)}

- 返回值类型

    ##${s.returnType}##

- 示例

    ${s.example}
`.trim()
}

function buildArgsInfo(args: readonly UsageArg[]): string {
    if (args.length === 0)
        return '    无参数'
    return `<table>
<tr><th>参数名</th><th>参数类型</th><th>可重复</th><th>可选</th><th>参数描述</th></tr>
${args
    .map((a: UsageArg): string => {
        let str = '<tr>'
        str += `<td>${a.name}</td>}`
        str += `<td>##${a.types}##</td>`
        str += `<td>${a.repeated ? '✔️' : '❌'}</td>`
        str += `<td>${a.optional ? '✔️' : '❌'}</td>`
        str += `<td>${a.description}</td>`
        str += '</tr>'
        return str
    })
    .join('\n')}
</table>`
}
