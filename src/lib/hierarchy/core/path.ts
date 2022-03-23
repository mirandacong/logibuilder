// tslint:disable: max-classes-per-file
import {Builder} from '@logi/base/ts/common/builder'
import {
    Exception,
    ExceptionBuilder,
    isException,
} from '@logi/base/ts/common/exception'
import {
    NAME_ILLEGAL_CHAR,
    reflex as reflex2,
    reflexSuccess,
    RefToken,
    RefTokenType,
} from '@logi/src/lib/dsl/lexer/v2'

import {Label} from './label'

/**
 * This path is the simplify version of pathlib
 *      https://docs.python.org/3/library/pathlib.html
 *      https://github.com/python/cpython/blob/3.7/Lib/pathlib.py
 *
 * There are following diference with pathlib
 *      - The defination of `Part`
 *      - The content of `root`, pathlib use `/`, this class use ``.
 */
export interface Path {
    readonly head: Part
    readonly parent: Path
    readonly parts: readonly Part[]
    readonly alias: string
    toString(): string
    /**
     * This will return an exception when this path is not an abs path.
     */
    resolve(): Path | Exception
    /**
     * There are following cases will return an exception
     *      - One of this path or input path is relative path.
     *      - There is no common ancestor.
     */
    relativeTo(path: Path): Path | Exception
    isAbsolute(): boolean
}

class PathImpl implements Path {
    public get head(): Part {
        if (this.parts.length > 0)
            return this.parts[this.parts.length - 1]
        return new PartBuilder().name('').build()
    }

    public get parent(): Path {
        const parentParts = [...this.parts]
        parentParts.pop()
        return new PathBuilder().parts(parentParts).build()
    }
    public parts!: readonly Part[]
    public root?: Part
    public alias = ''

    public toString(): string {
        if (this.parts.length === 0)
            return ''
        const p = this.parts
            .slice()
            .filter(part => part.name !== '.')
            .map((part: Part): string => {
                let n = part.name
                NAME_ILLEGAL_CHAR.forEach((c: string): void => {
                    n = n.replace(c, `\\${c}`)
                })
                return n
            })
            .join('!')
        return this.alias !== '' ? `${p}@${this.alias}` : p
    }

    public resolve(): Path | Exception {
        if (this.isAbsolute())
            return new PathBuilder().parts(normalize(this.parts)).build()
        return new ExceptionBuilder()
            .message('This path is relative path.')
            .build()
    }

    public relativeTo(p: Path): Path | Exception {
        const resolvedPath = p.resolve()
        const resolvedThis = this.resolve()
        if (isException(resolvedPath) || isException(resolvedThis))
            return [resolvedPath, resolvedThis].find(isException) as Exception
        const inputParts = resolvedPath.parts
        const thisParts = resolvedThis.parts
        const commonParts: Part[] = []
        for (let i = 0; i < inputParts.length; i += 1) {
            if (!thisParts[i])
                break
            if (!thisParts[i].equal(inputParts[i]))
                break
            commonParts.push(thisParts[i])
        }
        const relativeParts: Part[] = []
        if (inputParts.length === commonParts.length)
            relativeParts.push(new PartBuilder().name('.').build())
        for (let i = commonParts.length; i < inputParts.length; i += 1)
            relativeParts.push(new PartBuilder().name('..').build())
        for (let i = commonParts.length; i < thisParts.length; i += 1)
            relativeParts.push(thisParts[i])
        return new PathBuilder().parts(relativeParts).build()
    }

    public isAbsolute(): boolean {
        return this.root !== undefined
    }
}

export class PathBuilder extends Builder<Path, PathImpl> {
    public constructor(obj?: Readonly<Path>) {
        const impl = new PathImpl()
        if (obj)
            PathBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public static buildFromString(refname: string): Path | Exception {
        const tokens = reflex2(`{${refname}}`)
        const parts: Part[] = []
        let name: string | undefined
        let labels: string[] = []
        let alias = ''
        if (!reflexSuccess(tokens))
            return new ExceptionBuilder().message(`${refname}语法有误`).build()
        tokens.forEach((refTok: RefToken): void => {
            if (refTok.type === RefTokenType.REF_START ||
                refTok.type === RefTokenType.REF_END)
                return
            if (refTok.type === RefTokenType.SPLITTER && name !== undefined) {
                const part = new PartBuilder().name(name).labels(labels).build()
                parts.push(part)
                name = undefined
                labels = []
                return
            }
            if (refTok.type === RefTokenType.LABEL) {
                labels.push(refTok.image.trim())
                return
            }
            if (refTok.type === RefTokenType.PART) {
                let n = refTok.image.trim()
                NAME_ILLEGAL_CHAR.forEach((char: string): void => {
                    n = n.replace(`\\${char}`, `${char}`)
                })
                name = n
                return
            }
            if (refTok.type === RefTokenType.ALIAS) {
                const str = refTok.image.replace(/@/g, '').trim()
                alias = str
                return
            }
        })
        if (name !== undefined) {
            const part = new PartBuilder().name(name).labels(labels).build()
            parts.push(part)
        }
        return new PathBuilder().parts(parts).alias(alias).build()
    }

    public parts(parts: readonly Part[]): this {
        this.getImpl().parts = parts
        return this
    }

    public alias(alias: string): this {
        this.getImpl().alias = alias
        return this
    }

    protected preBuildHook(): void {
        const parts = this.getImpl().parts
        const relativePrefixList = ['.', '..']
        if (parts.length > 0 && !relativePrefixList.includes(parts[0].name))
            this.getImpl().root = new PartBuilder().name('').build()
    }
}

export interface CompareOption {
    /**
     * If true, compare each part with name and label, if false, compare name
     * only.
     */
    readonly withLabel: boolean
}

class CompareOptionImpl implements CompareOption {
    public withLabel = true
}

export class CompareOptionBuilder extends Builder <
    CompareOption, CompareOptionImpl> {
    public constructor(obj?: Readonly<CompareOption>) {
        const impl = new CompareOptionImpl()
        if (obj)
            CompareOptionBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public withLabel(withLabel: boolean): this {
        this.getImpl().withLabel = withLabel
        return this
    }
}

export function equals(
    lhs: Path,
    rhs: Path,
    // tslint:disable-next-line: no-optional-parameter
    compareOption?: CompareOption,
): boolean {
    const resolvedLhs = lhs.resolve()
    const resolvedRhs = rhs.resolve()
    if (isException(resolvedLhs) || isException(resolvedRhs))
        return false
    const lhsParts = resolvedLhs.parts
    const rhsParts = resolvedRhs.parts
    if (lhsParts.length === rhsParts.length &&
            lhsParts.every((value: Part, index: number): boolean =>
                value.equal(rhsParts[index], compareOption)))
        return true
    return false
}

export function join(...pathList: readonly Path[]): Path {
    return pathList.reduce((lhs: Path, rhs: Path): Path =>
            new PathBuilder().parts([...lhs.parts, ...rhs.parts]).build())
}

export interface Part {
    readonly name: string
    readonly labels: readonly Label[]
    toString(): string
    equal(part: Part, compareOption?: CompareOption): boolean
}

class PartImpl implements Part {
    public name!: string
    public labels: readonly Label[] = []
    public toString(): string {
        return this.name
    }

    public equal(part: Part, compareOption: CompareOption): boolean {
        if (part.name !== this.name)
            return false

        if (compareOption && !compareOption.withLabel)
            return true

        if (part.labels.length !== this.labels.length)
            return false

        return this.labels.every((label: Label): boolean =>
            part.labels.includes(label),
        )
    }
}

export class PartBuilder extends Builder<Part, PartImpl> {
    public constructor(obj?: Readonly<Part>) {
        const impl = new PartImpl()
        if (obj)
            PartBuilder.shallowCopy(impl, obj)
        super(impl)
    }
    public name(name: string): this {
        this.getImpl().name = name
        return this
    }

    public labels(labels: readonly Label[]): this {
        this.getImpl().labels = labels
        return this
    }

    protected get daa(): readonly string[] {
        return PartBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['name']
}

export function normalize(parts: readonly Part[]): readonly Part[] {
    const ret: Part[] = []
    const tokens = parts.slice()
    while (true) {
        if (tokens.length === 0)
            break

        const t = tokens.shift()
        if (!t)
            break
        const name = t.name
        if (name === '..')
            ret.pop()
        else if (name !== '.' && name !== '')
            ret.push(t)
    }
    return ret
}
