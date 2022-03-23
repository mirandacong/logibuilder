import {readFileSync} from 'fs'

import {menuParse} from '../gen_menu'

function genMenu(): void {
    // tslint:disable-next-line: no-magic-numbers
    const menuFile: string = process.argv[2]
    const content = readFileSync(menuFile, 'utf-8')
    const input = JSON.parse(content) as any
    const menuGroup = menuParse(input.menu)
    // tslint:disable-next-line: no-console
    console.log(JSON.stringify(menuGroup))
}

if (require.main === module)
    genMenu()
