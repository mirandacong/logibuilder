import {readFileSync} from 'fs'

import {routerParse} from '../gen_router'

function genRouter(): void {
    // tslint:disable-next-line: no-magic-numbers
    const menuFile: string = process.argv[2]
    const content = readFileSync(menuFile, 'utf-8')
    const input = JSON.parse(content) as any
    const urls = routerParse(input.menu)
    // tslint:disable-next-line: no-console
    console.log(JSON.stringify({urls}))
}

if (require.main === module)
    genRouter()
