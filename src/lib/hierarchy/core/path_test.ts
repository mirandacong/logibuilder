// tslint:disable: no-magic-numbers

import {isException} from '@logi/base/ts/common/exception'

import {normalize, Part, PartBuilder, Path, PathBuilder} from './path'

type BuildPathTestData = readonly [
    // parts
    readonly string[],
    // path string
    string,
    // head name
    string,
    // parent
    readonly string[],
    // is abs
    boolean,
    // resolve result
    readonly string[]
]

function toPath(parts: readonly string[]): Path {
    return new PathBuilder()
        .parts(parts
            .map((s: string): Part => new PartBuilder().name(s).build()))
        .build()
}

// tslint:disable-next-line:max-func-body-length
describe('build path test', (): void => {
    // tslint:disable-next-line: naming-convention
    const DATA: BuildPathTestData[] = [
        [
            ['a', 'b', 'c'],
            'a!b!c',
            'c',
            ['a', 'b'],
            true,
            ['a', 'b', 'c'],
        ],
        [
            ['a', 'b', 'c', 'd'],
            'a!b!c!d',
            'd',
            ['a', 'b', 'c'],
            true,
            ['a', 'b', 'c', 'd'],
        ],
        [
            ['a'],
            'a',
            'a',
            [],
            true,
            ['a'],
        ],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code max-func-body-length
    DATA.forEach((d: BuildPathTestData): void => {
        it(d[0].join('/'), (): void => {
            const path = toPath(d[0])
            expect(path.toString()).toBe(d[1])
            expect(path.head.name).toBe(d[2])
            const expectParent = toPath(d[3])
            expect(path.parent).toEqual(expectParent)
            expect(path.isAbsolute()).toEqual(d[4])
            const expectResolvedResult = toPath(d[5])
            const actualResolvedResult = path.resolve() as Path
            expect(expectResolvedResult).toEqual(actualResolvedResult)
        })
    })
})

type NormalizeTestData = readonly [readonly string[], readonly string[]]

describe('normalize test', (): void => {
    const data: NormalizeTestData[] = [
        [
            ['a', 'b', 'c'], ['a', 'b', 'c'],
        ],
        [
            ['a', '.', 'c'], ['a', 'c'],
        ],
        [
            ['a', '', 'c'], ['a', 'c'],
        ],
        [
            ['a', '..', 'c'], ['c'],
        ],
        [
            ['a', '..', '..', 'c'], ['c'],
        ],
        [
            ['a', '..', '..', '..', 'c'], ['c'],
        ],
        [
            [''], [''],
        ],
        [
            ['.'], [''],
        ],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: NormalizeTestData): void => {
        it(d[0].join(''), (): void => {
            const inputParts = d[0].map((s: string): Part => new PartBuilder()
                .name(s)
                .build())
            const outputParts = d[1].map((s: string): Part => new PartBuilder()
                .name(s)
                .build())
            expect(normalize(inputParts).join('/')).toBe(outputParts.join('/'))
        })
    })
})

/**
 * RelativeToTestData: [src, relativeTo, expect]
 */
type RelativeToTestData =
    readonly [readonly string[], readonly string[], readonly string[]]

describe('relativeTo test', (): void => {
    const data: RelativeToTestData[] = [
        [
            ['a', 'b', 'c'], ['a', 'b'], ['.', 'c'],
        ],
        [
            ['a', 'b'], ['a', 'b', 'c'], ['..'],
        ],
        [
            ['a', 'b', 'c'], ['a'], ['.', 'b', 'c'],
        ],
        [
            ['a'], ['a', 'b', 'c'], ['..', '..'],
        ],
        [
            ['a', 'b', 'c'], ['a', 'b', 'd'], ['..', 'c'],
        ],
        [
            ['a', 'c'], ['a', 'b', 'd'], ['..', '..', 'c'],
        ],
        [
            ['a', 'c', 'e'], ['a', 'b', 'd'], ['..', '..', 'c', 'e'],
        ],
    ]
    // tslint:disable-next-line: mocha-no-side-effect-code
    data.forEach((d: RelativeToTestData): void => {
        it(d[0].join(''), (): void => {
            const srcParts = d[0].map((s: string): Part => new PartBuilder()
                .name(s)
                .build())
            const srcPath = new PathBuilder().parts(srcParts).build()
            const relativeToParts = d[1].map(
                (s: string): Part => new PartBuilder().name(s).build(),
            )
            const relativeToPath = new PathBuilder()
                .parts(relativeToParts)
                .build()
            const expectedParts = d[2].map(
                (s: string): Part => new PartBuilder().name(s).build(),
            )
            const expected = new PathBuilder().parts(expectedParts).build()
            expect(srcPath.relativeTo(relativeToPath)).toEqual(expected)
        })
    })
})

describe('escape test', (): void => {
    it('', (): void => {
        const pathStr = 'a\\@!b!c'
        const path = PathBuilder.buildFromString(pathStr)
        expect(isException(path)).toBe(false)
        if (isException(path))
            return
        expect(path.parts.map(p => p.name)).toEqual(['a@', 'b', 'c'])
    })
})
