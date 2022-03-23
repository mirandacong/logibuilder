/**
 * Reference from vscode (vs/editor/browser/widget/codeEditorWidget.ts)
 */
// tslint:disable: split-parameters-of-func-sign quotemark
const SQUIGGLY_START = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 3' enable-background='new 0 0 6 3' height='3' width='6'><g fill='`)
const SQUIGGLY_END = encodeURIComponent(`'><polygon points='5.5,0 2.5,3 1.1,3 4.1,0'/><polygon points='4,0 6,2 6,0.6 5.4,0'/><polygon points='0,2 1,3 2.4,3 0,0.6'/></g></svg>`)

export const ERROR_COLOR = '#f48771'

const EDITOR_GLOBAL_STYLE_CLASS = 'logi-editor-global-style'

// tslint:disable-next-line: naming-convention
export function getSquigglySVGData(color: string): string {
    return SQUIGGLY_START + encodeURIComponent(color) + SQUIGGLY_END
}

export function addEditorGlobalStyle(): void {
    const svg = getSquigglySVGData(ERROR_COLOR)
    const rule = `.t-wave-error { background: url("data:image/svg+xml,${svg}") repeat-x bottom left; }`

    const styles = document.getElementsByClassName(EDITOR_GLOBAL_STYLE_CLASS)
    if (styles.length !== 0) {
        // tslint:disable-next-line: no-inner-html
        styles[0].innerHTML = rule
        return
    }
    const style = document.createElement('style')
    style.type = 'text/css'
    style.className = EDITOR_GLOBAL_STYLE_CLASS
    // tslint:disable-next-line: no-inner-html
    style.innerHTML = rule
    document.head.appendChild(style)
}
