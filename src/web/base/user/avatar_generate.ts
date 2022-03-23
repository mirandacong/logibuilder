export function getAvatarText(name: string): string {
    const trimName = name.trim()
    const re = /[\u4e00-\u9fa5]/
    const isCn = re.test(trimName)
    /**
     * Using first character if it is an English name
     * Using last character if it is a Chinese name
     */
    return isCn ? trimName.slice(trimName.length - 1) : trimName
        .slice(0, 1)
        .toLocaleUpperCase()
}

export interface TextAvatarConfig {
    // width and height
    readonly size: number
    readonly fontSize?: number
}

const DEFUALT_TEXT_AVATAR_CONFIG: TextAvatarConfig = {
    size: 72,
}

export function generateAvatarImgUrl(
    name: string,
    config = DEFUALT_TEXT_AVATAR_CONFIG,
): string {
    const text = getAvatarText(name)
    const canvas = document.createElement('canvas')
    const size = config.size
    // tslint:disable-next-line: no-magic-numbers
    const fontSize = config.fontSize ?? size * 2 / 3
    // tslint:disable-next-line: no-magic-numbers
    const radius = size / 2
    canvas.width = canvas.height = config.size
    const ctx = canvas.getContext('2d')
    if (!ctx)
        return ''
    ctx.beginPath()
    // tslint:disable-next-line: no-magic-numbers
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI, false)
    ctx.closePath()
    ctx.fillStyle = 'grey'
    ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = 'center'
    // tslint:disable-next-line: no-magic-numbers
    ctx.fillText(text, radius, radius * 4 / 3 + 2)
    /**
     * url like: 'data:image/png;base64,...'
     */
    return canvas.toDataURL()
}

export function generateAvatarImgBase64(
    name: string,
    config = DEFUALT_TEXT_AVATAR_CONFIG,
): string {
    const imgUrl = generateAvatarImgUrl(name, config)
    return imgUrl.replace(/data:image\/[a-z]+;base64,/, '')
}
