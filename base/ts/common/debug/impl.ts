// tslint:disable: no-magic-numbers
// tslint:disable: no-console
let DEBUG_MODE = false

const MIN_DURATION = 5

export function useDebugMode(): void {
    DEBUG_MODE = true
}

export function debugTimer(name: string): Function {
    // tslint:disable-next-line: ext-variable-name naming-convention
    return (_: object, __: string, descriptor: PropertyDescriptor): void => {
        const oldFunc = descriptor.value
        descriptor.value = function(): unknown {
            if (!DEBUG_MODE)
                // tslint:disable-next-line: no-invalid-this
                return oldFunc.apply(this, arguments)
            if (!HINT_PRINTED)
                printHint()
            const start = Date.now()
            // tslint:disable-next-line: no-invalid-this
            const res = oldFunc.apply(this, arguments)
            const end = Date.now()
            const duration = end - start
            const log =
`  ${name}:    \t${duration} ms`
            if (duration >= MIN_DURATION)
                console.log(log)
            return res
        }
    }
}

let HINT_PRINTED = false

function printHint(): void {
    console.log(`
Only print the function cost larger than ${MIN_DURATION} ms.`)
    console.log('Notice that the speed in nodejs is faster than browser.')
    HINT_PRINTED = true
}
